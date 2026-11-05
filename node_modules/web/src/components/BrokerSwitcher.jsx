import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2 } from 'lucide-react';

const BrokerSwitcher = () => {
  const { currentUser, brokerId, switchBroker } = useAuth();
  const [brokers, setBrokers] = useState([]);
  
  useEffect(() => {
    if (currentUser?.role === 'super_admin') {
      fetchBrokers();
    }
  }, [currentUser]);

  const fetchBrokers = async () => {
    try {
      const records = await pb.collection('brokers').getFullList({
        sort: 'name',
        $autoCancel: false
      });
      setBrokers(records);
    } catch (err) {
      console.error('Failed to fetch brokers:', err);
    }
  };

  if (currentUser?.role !== 'super_admin') return null;

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select value={brokerId || ''} onValueChange={switchBroker}>
        <SelectTrigger className="w-[200px] h-8 text-xs bg-background">
          <SelectValue placeholder="Select Broker" />
        </SelectTrigger>
        <SelectContent>
          {brokers.map(broker => (
            <SelectItem key={broker.id} value={broker.broker_id}>
              {broker.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BrokerSwitcher;