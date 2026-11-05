import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useLanguage } from '@/contexts/LanguageContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    broker_id: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error(t('auth.passwords_mismatch'));
      return;
    }

    if (formData.password.length < 8) {
      toast.error(t('auth.password_short'));
      return;
    }

    if (!formData.broker_id.trim()) {
      toast.error(t('auth.broker_id_required'));
      return;
    }

    setLoading(true);

    try {
      await signup(
        formData.email,
        formData.password,
        formData.full_name,
        formData.phone,
        formData.broker_id.trim()
      );
      toast.success(t('auth.signup_success'));
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup failed:', error);
      if (error.message && error.message.includes('email')) {
        toast.error(t('auth.email_exists'));
      } else {
        toast.error(t('auth.signup_failed'));
      }
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
        <title>{t('nav.signup')} - {t('common.brand')}</title>
        <meta name="description" content={t('auth.signup_desc')} />
      </Helmet>

      <div className="flex-1 flex items-center justify-center bg-muted/30 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold lang-text-transition">{t('auth.create_account')}</CardTitle>
            <CardDescription className="lang-text-transition">
              {t('auth.signup_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="lang-text-transition">{t('auth.full_name')}</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="Maya Chen"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="lang-text-transition">{t('auth.email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="lang-text-transition">{t('auth.phone')}</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                  className="text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="broker_id" className="lang-text-transition">{t('auth.broker_id')}</Label>
                <Input
                  id="broker_id"
                  name="broker_id"
                  type="text"
                  placeholder=""
                  value={formData.broker_id}
                  onChange={handleChange}
                  required
                  className="text-foreground"
                />
                <p className="text-xs text-muted-foreground lang-text-transition">
                  {t('auth.broker_id_help')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="lang-text-transition">{t('auth.password')}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder=""
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="lang-text-transition">{t('auth.confirm_password')}</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder=""
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="text-foreground"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full lang-text-transition" 
                disabled={loading}
              >
                {loading ? t('common.loading') : t('nav.signup')}
              </Button>

              <p className="text-center text-sm text-muted-foreground lang-text-transition">
                {t('auth.already_have_account')}{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  {t('nav.login')}
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SignupPage;