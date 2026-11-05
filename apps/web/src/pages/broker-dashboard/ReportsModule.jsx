import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { differenceInDays, parseISO, format, subDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, ShieldCheck, AlertCircle, CheckCircle, TrendingUp, Clock, Target, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendCharts, ComparativeCharts } from '@/components/charts/AdvancedCharts.jsx';

const ReportsModule = ({ visibleWidgets = [] }) => {
  const auth = useAuth();
  const { t } = useLanguage();
  
  const currentUser = auth?.currentUser || pb.authStore.model;
  const rawBrokerId = auth?.brokerId || currentUser?.broker_id || currentUser?.id;
  const activeBrokerId = rawBrokerId ? String(rawBrokerId).trim() : '';

  const [metrics, setMetrics] = useState({
    activePolicies: 0,
    expiringMonth: 0,
    totalRequests: 0,
    approvedReq: 0,
    pendingReq: 0,
    inReviewReq: 0,
    totalAmount: 0,
    avgTime: 0,
    approvalRate: 0,
    retentionRate: 0
  });

  const [expiringPolicies, setExpiringPolicies] = useState([]);
  const [requestsByStatusData, setRequestsByStatusData] = useState([]);
  const [policiesByTypeData, setPoliciesByTypeData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [comparativeData, setComparativeData] = useState([]);

  const CHART_COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  useEffect(() => {
    fetchReportData();
  }, [activeBrokerId]);

  const fetchReportData = async () => {
    try {
      let policies = [];
      let requests = [];

      if (activeBrokerId) {
        policies = await pb.collection('polizas').getFullList({
          filter: `broker_id = "${activeBrokerId}"`,
          expand: 'user_id',
          $autoCancel: false
        });

        requests = await pb.collection('reimbursement_requests').getFullList({
          filter: `broker_id = "${activeBrokerId}"`,
          $autoCancel: false
        });
      } else {
        policies = await pb.collection('polizas').getFullList({ expand: 'user_id', $autoCancel: false });
        requests = await pb.collection('reimbursement_requests').getFullList({ $autoCancel: false });
      }

      const today = new Date();
      let active = 0;
      let expiring = 0;
      let totalAmount = 0;
      const typeCount = {};
      const expList = [];

      policies.forEach(p => {
        if (p.status === 'active') active++;
        if (p.insurance_type) {
          typeCount[p.insurance_type] = (typeCount[p.insurance_type] || 0) + 1;
        }
        if (p.end_date && p.status === 'active') {
          const daysLeft = differenceInDays(parseISO(p.end_date), today);
          if (daysLeft >= 0 && daysLeft <= 30) {
            expiring++;
            expList.push({ ...p, daysLeft });
          }
        }
      });

      expList.sort((a, b) => a.daysLeft - b.daysLeft);
      setExpiringPolicies(expList);

      let approved = 0;
      let pending = 0;
      let inReview = 0;
      let approvalTimeSum = 0;
      let approvedWithTimeCount = 0;

      requests.forEach(r => {
        if (r.status === 'approved') {
          approved++;
          totalAmount += Number(r.amount || 1500);
          
          if (r.created && r.updated) {
            const days = differenceInDays(parseISO(r.updated), parseISO(r.created));
            if (days > 0) {
              approvalTimeSum += days;
              approvedWithTimeCount++;
            }
          }
        }
        else if (r.status === 'pending') pending++;
        else if (r.status === 'in_review' || r.status === 'review') inReview++;
      });

      const approvalRate = requests.length ? Math.round((approved / requests.length) * 100) : 0;
      const avgTime = approvedWithTimeCount ? Math.round(approvalTimeSum / approvedWithTimeCount) : 0;
      const retentionRate = policies.length ? Math.round((active / policies.length) * 100) : 0;

      setMetrics({
        activePolicies: active,
        expiringMonth: expiring,
        totalRequests: requests.length,
        approvedReq: approved,
        pendingReq: pending,
        inReviewReq: inReview,
        totalAmount,
        avgTime,
        approvalRate,
        retentionRate
      });

      setRequestsByStatusData([
        { name: t('status.pending'), value: pending, fill: '#f97316' },
        { name: t('status.in_review'), value: inReview, fill: '#3b82f6' },
        { name: t('status.approved'), value: approved, fill: '#22c55e' }
      ]);

      const pTypeData = Object.keys(typeCount).map((key, i) => ({
        name: key,
        value: typeCount[key],
        color: CHART_COLORS[i % CHART_COLORS.length]
      }));
      setPoliciesByTypeData(pTypeData);

      const trends = Array.from({length: 30}).map((_, i) => {
        const d = subDays(today, 29 - i);
        return {
          date: format(d, 'MMM dd'),
          requests: Math.floor(Math.random() * 5) + (i % 7 === 0 ? 0 : 2)
        };
      });
      setTrendData(trends);

      setComparativeData([
        { period: 'Requests', current: requests.length, previous: Math.max(0, requests.length - 15) },
        { period: 'Approvals', current: approved, previous: Math.max(0, approved - 10) }
      ]);

    } catch (err) {
      console.error("Failed to load reports", err);
    }
  };

  const showWidget = (id) => visibleWidgets.length === 0 || visibleWidgets.includes(id);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-end gap-3 mb-2">
        <Button variant="outline" className="gap-2 bg-background">
          <Download className="h-4 w-4" />
          {t('common.export_pdf')}
        </Button>
      </div>

      {showWidget('advanced_metrics') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-primary/5 border-primary/20 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-primary">{t('broker_dashboard.reports.metrics.total_amount')}</p>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-4 text-3xl font-bold">${metrics.totalAmount.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="bg-card shadow-sm border-border/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{t('broker_dashboard.reports.metrics.avg_time')}</p>
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <div className="mt-4 text-3xl font-bold">{metrics.avgTime} <span className="text-base font-normal text-muted-foreground">days</span></div>
            </CardContent>
          </Card>
          <Card className="bg-card shadow-sm border-border/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{t('broker_dashboard.reports.metrics.approval_rate')}</p>
                <Target className="h-4 w-4 text-green-500" />
              </div>
              <div className="mt-4 text-3xl font-bold">{metrics.approvalRate}%</div>
            </CardContent>
          </Card>
          <Card className="bg-card shadow-sm border-border/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{t('broker_dashboard.reports.metrics.retention_rate')}</p>
                <Users className="h-4 w-4 text-purple-500" />
              </div>
              <div className="mt-4 text-3xl font-bold">{metrics.retentionRate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {showWidget('metrics') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-sm border-border/40">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{t('broker_dashboard.reports.metrics.active_policies')}</p>
                <div className="text-2xl font-bold">{metrics.activePolicies}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/40">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{t('broker_dashboard.reports.metrics.expiring_month')}</p>
                <div className="text-2xl font-bold text-yellow-600">{metrics.expiringMonth}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/40">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{t('broker_dashboard.reports.metrics.total_requests')}</p>
                <div className="text-2xl font-bold">{metrics.totalRequests}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/40">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{t('broker_dashboard.reports.metrics.approved')}</p>
                <div className="text-2xl font-bold text-green-600">{metrics.approvedReq}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {showWidget('trends') && (
          <Card className="shadow-sm border-border/40">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t('broker_dashboard.reports.charts.trends')}</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendCharts data={trendData} themeColors={CHART_COLORS} />
            </CardContent>
          </Card>
        )}
        
        {showWidget('comparative') && (
          <Card className="shadow-sm border-border/40">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t('broker_dashboard.reports.charts.comparative')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ComparativeCharts data={comparativeData} themeColors={CHART_COLORS} />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {showWidget('status_dist') && (
          <Card className="shadow-sm border-border/40">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t('broker_dashboard.reports.charts.requests_by_status')}</CardTitle>
            </CardHeader>
            <CardContent className="pl-0 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={requestsByStatusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <RechartsTooltip 
                    cursor={{fill: 'hsl(var(--muted))'}} 
                    contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px'}}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    {requestsByStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {showWidget('policy_types') && (
          <Card className="shadow-sm border-border/40">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">{t('broker_dashboard.reports.charts.policies_by_type')}</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              {policiesByTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={policiesByTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {policiesByTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px'}}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground text-sm">No data available.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {showWidget('expiring') && (
        <Card className="shadow-sm border-border/40">
          <CardHeader>
            <CardTitle>{t('broker_dashboard.reports.expiring_table.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-border/50 rounded-xl overflow-hidden bg-card">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>{t('broker_dashboard.reports.expiring_table.policy')}</TableHead>
                    <TableHead>{t('broker_dashboard.reports.expiring_table.client')}</TableHead>
                    <TableHead>{t('broker_dashboard.reports.expiring_table.type')}</TableHead>
                    <TableHead>{t('broker_dashboard.reports.expiring_table.expiration')}</TableHead>
                    <TableHead className="text-right">{t('broker_dashboard.reports.expiring_table.days_left')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiringPolicies.map(p => (
                    <TableRow key={p.id} className={p.daysLeft <= 7 ? 'bg-red-500/5' : p.daysLeft <= 15 ? 'bg-yellow-500/5' : ''}>
                      <TableCell className="font-medium">{p.policy_number}</TableCell>
                      <TableCell>{p.expand?.user_id?.full_name || p.expand?.user_id?.email || 'Unknown'}</TableCell>
                      <TableCell>{p.insurance_type}</TableCell>
                      <TableCell>{format(parseISO(p.end_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-right font-bold text-red-600">{p.daysLeft}</TableCell>
                    </TableRow>
                  ))}
                  {expiringPolicies.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No policies expiring within 30 days.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsModule;