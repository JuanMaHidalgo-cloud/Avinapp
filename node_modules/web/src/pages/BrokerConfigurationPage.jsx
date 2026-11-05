import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useTheme } from '@/contexts/DynamicThemeProvider.jsx';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import Sidebar from '@/components/Sidebar.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const BrokerConfigurationPage = () => {
  const { brokerId } = useAuth();
  const { refreshTheme } = useTheme();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [configId, setConfigId] = useState(null);
  const [formData, setFormData] = useState({
    broker_name: '',
    logo_url: '',
    primary_color: '#3b82f6',
    secondary_color: '#8b5cf6',
    company_email: ''
  });

  useEffect(() => {
    fetchConfig();
  }, [brokerId]);

  const fetchConfig = async () => {
    if (!brokerId) return;

    try {
      const config = await pb.collection('broker_configuration').getFirstListItem(
        `broker_id="${brokerId}"`,
        { $autoCancel: false }
      );
      setConfigId(config.id);
      setFormData({
        broker_name: config.broker_name || '',
        logo_url: config.logo_url || '',
        primary_color: config.primary_color || '#3b82f6',
        secondary_color: config.secondary_color || '#8b5cf6',
        company_email: config.company_email || ''
      });
    } catch (error) {
      console.error('Failed to fetch configuration:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (configId) {
        await pb.collection('broker_configuration').update(configId, formData, { $autoCancel: false });
      } else {
        await pb.collection('broker_configuration').create({
          ...formData,
          broker_id: brokerId
        }, { $autoCancel: false });
      }
      
      await refreshTheme();
      toast.success(t('broker_config.save_success'));
    } catch (error) {
      console.error('Failed to save configuration:', error);
      toast.error(t('broker_config.save_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Helmet>
        <title>{t('nav.admin_panel')} - {t('common.brand')}</title>
        <meta name="description" content={t('broker_config.subtitle')} />
      </Helmet>

      <div className="flex-1 flex flex-col">
        <Header />
        
        <div className="flex flex-1">
          <Sidebar />
          
          <main className="flex-1 p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight lang-text-transition">{t('broker_config.title')}</h1>
                <p className="text-muted-foreground mt-1 lang-text-transition">
                  {t('broker_config.subtitle')}
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="lang-text-transition">{t('broker_config.branding_settings')}</CardTitle>
                    <CardDescription className="lang-text-transition">
                      {t('broker_config.branding_desc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="broker_name" className="lang-text-transition">{t('broker_config.broker_name')}</Label>
                        <Input
                          id="broker_name"
                          name="broker_name"
                          type="text"
                          placeholder="Meridian Insurance Group"
                          value={formData.broker_name}
                          onChange={handleChange}
                          required
                          className="text-foreground"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="logo_url" className="lang-text-transition">{t('broker_config.logo_url')}</Label>
                        <Input
                          id="logo_url"
                          name="logo_url"
                          type="url"
                          placeholder="https://example.com/logo.png"
                          value={formData.logo_url}
                          onChange={handleChange}
                          className="text-foreground"
                        />
                        {formData.logo_url && (
                          <div className="mt-2 p-4 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-2 lang-text-transition">{t('common.preview')}</p>
                            <img 
                              src={formData.logo_url} 
                              alt="Logo preview"
                              className="h-12 w-auto object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="primary_color" className="lang-text-transition">{t('broker_config.primary_color')}</Label>
                        <div className="flex gap-2">
                          <Input
                            id="primary_color"
                            name="primary_color"
                            type="color"
                            value={formData.primary_color}
                            onChange={handleChange}
                            className="w-20 h-10 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={formData.primary_color}
                            onChange={(e) => setFormData({...formData, primary_color: e.target.value})}
                            className="flex-1 text-foreground"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="secondary_color" className="lang-text-transition">{t('broker_config.secondary_color')}</Label>
                        <div className="flex gap-2">
                          <Input
                            id="secondary_color"
                            name="secondary_color"
                            type="color"
                            value={formData.secondary_color}
                            onChange={handleChange}
                            className="w-20 h-10 cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={formData.secondary_color}
                            onChange={(e) => setFormData({...formData, secondary_color: e.target.value})}
                            className="flex-1 text-foreground"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="company_email" className="lang-text-transition">{t('broker_config.company_email')}</Label>
                        <Input
                          id="company_email"
                          name="company_email"
                          type="email"
                          placeholder="contact@meridianinsurance.com"
                          value={formData.company_email}
                          onChange={handleChange}
                          className="text-foreground"
                        />
                      </div>

                      <Button type="submit" className="w-full lang-text-transition" disabled={loading}>
                        {loading ? t('common.saving') : t('common.save')}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="lang-text-transition">{t('broker_config.live_preview')}</CardTitle>
                    <CardDescription className="lang-text-transition">
                      {t('broker_config.preview_desc')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2 lang-text-transition">{t('broker_config.buttons')}</p>
                      <div className="flex gap-2">
                        <Button style={{backgroundColor: formData.primary_color}} className="lang-text-transition">
                          {t('broker_config.primary')}
                        </Button>
                        <Button variant="outline" style={{borderColor: formData.primary_color, color: formData.primary_color}} className="lang-text-transition">
                          {t('broker_config.outline')}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2 lang-text-transition">{t('broker_config.badges')}</p>
                      <div className="flex gap-2">
                        <Badge style={{backgroundColor: formData.primary_color}} className="lang-text-transition">{t('status.active')}</Badge>
                        <Badge style={{backgroundColor: formData.secondary_color}} className="lang-text-transition">{t('status.in_review')}</Badge>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2 lang-text-transition">{t('broker_config.card_accent')}</p>
                      <div 
                        className="p-4 rounded-lg border-l-4"
                        style={{borderLeftColor: formData.primary_color}}
                      >
                        <p className="text-sm lang-text-transition">{t('broker_config.sample_card')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default BrokerConfigurationPage;