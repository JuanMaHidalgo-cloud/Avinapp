import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { useAuth } from './AuthContext.jsx';

const DynamicThemeContext = createContext();

export const useTheme = () => useContext(DynamicThemeContext);

export const DynamicThemeProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [brokerConfig, setBrokerConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyTheme = (config) => {
    const root = document.documentElement;
    
    if (!config) {
      // Reset to defaults if no config
      root.style.removeProperty('--primary');
      root.style.removeProperty('--ring');
      root.style.removeProperty('--secondary');
      return;
    }
    
    const hexToHSL = (hex) => {
      if (!hex) return null;
      let r = 0, g = 0, b = 0;
      if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
      } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16);
        g = parseInt(hex.substring(3, 5), 16);
        b = parseInt(hex.substring(5, 7), 16);
      }
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    if (config.primary_color) {
      const hsl = hexToHSL(config.primary_color);
      if (hsl) {
        root.style.setProperty('--primary', hsl);
        root.style.setProperty('--ring', hsl);
      }
    }

    if (config.secondary_color) {
      const hsl = hexToHSL(config.secondary_color);
      if (hsl) {
        root.style.setProperty('--secondary', hsl);
      }
    }
  };

  const fetchConfig = async () => {
    const targetBrokerId = currentUser?.broker_id;

    if (!targetBrokerId) {
      setBrokerConfig(null);
      applyTheme(null);
      setLoading(false);
      return;
    }

    try {
      const branding = await pb.collection('broker_branding').getFirstListItem(`broker_id="${targetBrokerId}"`, { $autoCancel: false });
      if (branding) {
        setBrokerConfig(branding);
        applyTheme(branding);
      }
    } catch (error) {
      console.warn('Broker branding not found for this broker_id. Using defaults.');
      setBrokerConfig(null);
      applyTheme(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [currentUser?.broker_id]);

  return (
    <DynamicThemeContext.Provider value={{ brokerConfig, loading, refreshTheme: fetchConfig }}>
      {children}
    </DynamicThemeContext.Provider>
  );
};