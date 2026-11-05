import React from 'react';
import { cn } from '@/lib/utils';
import { Calendar, DollarSign, FileText, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays, parseISO } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext.jsx';

const PolicyCard = ({ policy }) => {
  const { t } = useLanguage();
  
  const isExpiringSoon = () => {
    if (!policy.end_date) return false;
    const endDate = parseISO(policy.end_date);
    const daysUntilExpiry = differenceInDays(endDate, new Date());
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  const isExpired = policy.status === 'expired';
  const expiringSoon = isExpiringSoon();

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-lg",
      expiringSoon && "ring-2 ring-yellow-500/50",
      isExpired && "opacity-75"
    )}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {policy.policy_number}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 lang-text-transition">{policy.insurance_type}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <Badge variant={isExpired ? "destructive" : "default"} className="lang-text-transition">
              {t(`status.${policy.status}`)}
            </Badge>
            {expiringSoon && (
              <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-700 lang-text-transition">
                <AlertTriangle className="h-3 w-3" />
                {t('policy.expiring_soon')}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {policy.coverage_amount && (
          <div className="flex items-center gap-2 text-sm lang-text-transition">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t('policy.coverage')}</span>
            <span className="font-medium">
              ${policy.coverage_amount.toLocaleString()}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm lang-text-transition">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{t('policy.period')}</span>
          <span className="font-medium">
            {policy.start_date ? format(parseISO(policy.start_date), 'MMM dd, yyyy') : 'N/A'} - {policy.end_date ? format(parseISO(policy.end_date), 'MMM dd, yyyy') : 'N/A'}
          </span>
        </div>

        {expiringSoon && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800 lang-text-transition">
              {t('policy.expires_in', { days: differenceInDays(parseISO(policy.end_date), new Date()) })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PolicyCard;