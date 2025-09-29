"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { HeroImageManager, HeroImage } from '@/components/ui/HeroImageManager';
import { Partner } from '@/components/ui/PartnerManager';
import { Loader2, Save, RefreshCw, AlertCircle, CheckCircle, Globe, Phone, MessageSquare, Users } from 'lucide-react';
import { CenterLoadingSkeleton } from '@/components/ui/skeleton-variants';

interface Setting {
  id: number;
  key: string;
  value: string;
  description?: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export default function WebsiteSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch settings from API
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/settings/bulk');

      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
      }

      const data = await response.json();

      // Convert settings array to object with key-value pairs
      const settingsObject = data.settings.reduce((acc: Record<string, string>, setting: Setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});

      setSettings(settingsObject);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Save individual setting
  const saveSetting = async (key: string, value: string) => {
    try {
      setSaving(true);
      const response = await fetch(`/api/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save setting: ${response.statusText}`);
      }

      setSettings(prev => ({ ...prev, [key]: value }));

      toast({
        title: 'Success',
        description: 'Setting saved successfully',
      });
    } catch (err) {
      console.error('Error saving setting:', err);
      toast({
        title: 'Error',
        description: 'Failed to save setting',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Save all settings in a section
  const saveSection = async (sectionSettings: Record<string, string>) => {
    try {
      setSaving(true);
      setError(null);

      const promises = Object.entries(sectionSettings).map(([key, value]) =>
        fetch(`/api/settings/${key}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ value }),
        })
      );

      const responses = await Promise.all(promises);

      if (responses.some(response => !response.ok)) {
        throw new Error('Failed to save some settings');
      }

      setSettings(prev => ({ ...prev, ...sectionSettings }));
      setSuccess('Settings saved successfully!');

      toast({
        title: 'Success',
        description: 'All settings in this section saved successfully',
      });

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Helper functions for hero images
  const getHeroImages = (): HeroImage[] => {
    try {
      // Don't try to parse if settings aren't loaded yet
      if (loading || !settings || Object.keys(settings).length === 0) {
        return [];
      }

      const heroImagesString = settings.hero_images;

      // Debug logging
      console.log('heroImagesString:', heroImagesString, 'type:', typeof heroImagesString);

      if (!heroImagesString ||
          heroImagesString === '' ||
          heroImagesString === 'undefined' ||
          heroImagesString === 'null' ||
          typeof heroImagesString !== 'string') {
        return [];
      }

      // Trim whitespace and check if it's valid JSON
      const trimmed = heroImagesString.trim();
      if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
        return [];
      }

      return JSON.parse(trimmed);
    } catch (error) {
      console.error('Error parsing hero images:', error, 'Value was:', settings.hero_images);
      return [];
    }
  };

  const saveHeroImages = async (images: HeroImage[]) => {
    try {
      const heroImagesString = JSON.stringify(images);
      await saveSetting('hero_images', heroImagesString);
    } catch (error) {
      console.error('Error saving hero images:', error);
      toast({
        title: 'Error',
        description: 'Failed to save hero images',
        variant: 'destructive',
      });
    }
  };

  // Fetch partners from API
  const fetchPartners = useCallback(async () => {
    try {
      const response = await fetch('/api/partners');

      if (!response.ok) {
        throw new Error(`Failed to fetch partners: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setPartners(data.partners);
      }
    } catch (err) {
      console.error('Error fetching partners:', err);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchPartners();
  }, [fetchSettings, fetchPartners]);

  if (loading) {
    return <CenterLoadingSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button variant="outline" size="sm" className="ml-4" onClick={fetchSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="@container/main space-y-6 max-w-full overflow-hidden">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Website Settings</h1>
        <p className="text-muted-foreground">
          Manage your website content, contact information, and display settings.
        </p>
      </div>

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="hero" className="space-y-6 w-full">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full min-w-fit grid-cols-6">
            <TabsTrigger value="hero" className="whitespace-nowrap">Hero Section</TabsTrigger>
            <TabsTrigger value="welcome" className="whitespace-nowrap">Welcome</TabsTrigger>
            <TabsTrigger value="contact" className="whitespace-nowrap">Contact</TabsTrigger>
            <TabsTrigger value="partners" className="whitespace-nowrap">Partners</TabsTrigger>
            <TabsTrigger value="social" className="whitespace-nowrap">Social Media</TabsTrigger>
            <TabsTrigger value="site" className="whitespace-nowrap">Site Info</TabsTrigger>
          </TabsList>
        </div>

        {/* Hero Section Settings */}
        <TabsContent value="hero">
          <div className="space-y-6">
            {/* Hero Text Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Hero Text Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="hero_title">Hero Title</Label>
                    <Input
                      id="hero_title"
                      value={settings.hero_title || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, hero_title: e.target.value }))}
                      placeholder="Enter hero title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
                    <Textarea
                      id="hero_subtitle"
                      value={settings.hero_subtitle || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, hero_subtitle: e.target.value }))}
                      placeholder="Enter hero subtitle"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="hero_primary_button">Primary Button Text</Label>
                      <Input
                        id="hero_primary_button"
                        value={settings.hero_primary_button || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, hero_primary_button: e.target.value }))}
                        placeholder="e.g., Get Started"
                      />
                    </div>

                    <div>
                      <Label htmlFor="hero_secondary_button">Secondary Button Text</Label>
                      <Input
                        id="hero_secondary_button"
                        value={settings.hero_secondary_button || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, hero_secondary_button: e.target.value }))}
                        placeholder="e.g., Learn More"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={() => saveSection({
                      hero_title: settings.hero_title,
                      hero_subtitle: settings.hero_subtitle,
                      hero_primary_button: settings.hero_primary_button,
                      hero_secondary_button: settings.hero_secondary_button,
                    })}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Hero Text
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Hero Images Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Hero Background Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                <HeroImageManager
                  images={getHeroImages()}
                  onImagesChange={saveHeroImages}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Welcome Section Settings */}
        <TabsContent value="welcome">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Welcome Section Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="welcome_enabled"
                  checked={settings.welcome_enabled === 'true'}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, welcome_enabled: checked ? 'true' : 'false' }))}
                />
                <Label htmlFor="welcome_enabled">Enable Welcome Section</Label>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="welcome_title">Welcome Title</Label>
                  <Input
                    id="welcome_title"
                    value={settings.welcome_title || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, welcome_title: e.target.value }))}
                    placeholder="Enter welcome title"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="welcome_person_name">Person Name</Label>
                    <Input
                      id="welcome_person_name"
                      value={settings.welcome_person_name || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, welcome_person_name: e.target.value }))}
                      placeholder="Enter person name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="welcome_person_title">Person Title</Label>
                    <Input
                      id="welcome_person_title"
                      value={settings.welcome_person_title || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, welcome_person_title: e.target.value }))}
                      placeholder="Enter person title"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="welcome_message">Welcome Message</Label>
                  <Textarea
                    id="welcome_message"
                    value={settings.welcome_message || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, welcome_message: e.target.value }))}
                    placeholder="Enter welcome message"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="welcome_photo">Photo URL</Label>
                  <Input
                    id="welcome_photo"
                    value={settings.welcome_photo || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, welcome_photo: e.target.value }))}
                    placeholder="Enter photo URL"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => saveSection({
                    welcome_enabled: settings.welcome_enabled,
                    welcome_title: settings.welcome_title,
                    welcome_person_name: settings.welcome_person_name,
                    welcome_person_title: settings.welcome_person_title,
                    welcome_message: settings.welcome_message,
                    welcome_photo: settings.welcome_photo,
                  })}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Welcome Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Section Settings */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="contact_title">Contact Section Title</Label>
                  <Input
                    id="contact_title"
                    value={settings.contact_title || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, contact_title: e.target.value }))}
                    placeholder="Enter contact title"
                  />
                </div>

                <div>
                  <Label htmlFor="contact_address">Address</Label>
                  <Textarea
                    id="contact_address"
                    value={settings.contact_address || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, contact_address: e.target.value }))}
                    placeholder="Enter office address"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_phone">Phone Number</Label>
                    <Input
                      id="contact_phone"
                      value={settings.contact_phone || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, contact_phone: e.target.value }))}
                      placeholder="+62 xxx xxx xxx"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact_email">Email Address</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={settings.contact_email || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                      placeholder="info@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_whatsapp">WhatsApp Number</Label>
                    <Input
                      id="contact_whatsapp"
                      value={settings.contact_whatsapp || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, contact_whatsapp: e.target.value }))}
                      placeholder="+62 xxx xxx xxx"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact_whatsapp_button">WhatsApp Button Text</Label>
                    <Input
                      id="contact_whatsapp_button"
                      value={settings.contact_whatsapp_button || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, contact_whatsapp_button: e.target.value }))}
                      placeholder="Contact via WhatsApp"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location_name">Location Name</Label>
                  <Input
                    id="location_name"
                    value={settings.location_name || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, location_name: e.target.value }))}
                    placeholder="Office location name"
                  />
                </div>

                <div>
                  <Label htmlFor="maps_embed_url">Google Maps Embed URL</Label>
                  <Textarea
                    id="maps_embed_url"
                    value={settings.maps_embed_url || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, maps_embed_url: e.target.value }))}
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    rows={3}
                    className="w-full break-all resize-none"
                    style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => saveSection({
                    contact_title: settings.contact_title,
                    contact_address: settings.contact_address,
                    contact_phone: settings.contact_phone,
                    contact_email: settings.contact_email,
                    contact_whatsapp: settings.contact_whatsapp,
                    contact_whatsapp_button: settings.contact_whatsapp_button,
                    location_name: settings.location_name,
                    maps_embed_url: settings.maps_embed_url,
                  })}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Contact Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Partners Settings */}
        <TabsContent value="partners">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Partners Preview
              </CardTitle>
              <CardDescription>
                View how partners appear on your homepage. For full management, visit the Partners section.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{partners.length}</div>
                    <div className="text-sm text-muted-foreground">Total Partners</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{partners.filter(p => p.isActive).length}</div>
                    <div className="text-sm text-muted-foreground">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-500">{partners.filter(p => !p.isActive).length}</div>
                    <div className="text-sm text-muted-foreground">Inactive</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{partners.filter(p => p.website).length}</div>
                    <div className="text-sm text-muted-foreground">With Links</div>
                  </div>
                </div>

                {/* Partners Preview */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Homepage Display Preview</h4>
                  <div className="flex justify-center gap-8 lg:gap-[70px] h-[42px]">
                    {partners.filter(p => p.isActive).slice(0, 5).map((partner) => (
                      <div key={partner.id} className="relative flex-1 max-w-[100px]">
                        <div className="relative w-full h-full">
                          <Image
                            src={partner.logoUrl}
                            alt={partner.name}
                            fill
                            className="object-contain opacity-60 hover:opacity-100 transition-opacity duration-300"
                            title={partner.name}
                          />
                        </div>
                      </div>
                    ))}
                    {partners.filter(p => p.isActive).length === 0 && (
                      <div className="text-center text-muted-foreground py-4">
                        No active partners to display
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center pt-4">
                  <Button onClick={() => window.location.href = '/dashboard/partners'}>
                    <Users className="mr-2 h-4 w-4" />
                    Manage Partners
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Settings */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="social_facebook">Facebook URL</Label>
                  <Input
                    id="social_facebook"
                    value={settings.social_facebook || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, social_facebook: e.target.value }))}
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div>
                  <Label htmlFor="social_instagram">Instagram URL</Label>
                  <Input
                    id="social_instagram"
                    value={settings.social_instagram || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, social_instagram: e.target.value }))}
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div>
                  <Label htmlFor="social_twitter">Twitter URL</Label>
                  <Input
                    id="social_twitter"
                    value={settings.social_twitter || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, social_twitter: e.target.value }))}
                    placeholder="https://twitter.com/..."
                  />
                </div>

                <div>
                  <Label htmlFor="social_youtube">YouTube URL</Label>
                  <Input
                    id="social_youtube"
                    value={settings.social_youtube || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, social_youtube: e.target.value }))}
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => saveSection({
                    social_facebook: settings.social_facebook,
                    social_instagram: settings.social_instagram,
                    social_twitter: settings.social_twitter,
                    social_youtube: settings.social_youtube,
                  })}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Social Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Site Information Settings */}
        <TabsContent value="site">
          <Card>
            <CardHeader>
              <CardTitle>Site Information Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="site_title">Site Title</Label>
                  <Input
                    id="site_title"
                    value={settings.site_title || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, site_title: e.target.value }))}
                    placeholder="Enter site title"
                  />
                </div>

                <div>
                  <Label htmlFor="site_subtitle">Site Subtitle</Label>
                  <Input
                    id="site_subtitle"
                    value={settings.site_subtitle || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, site_subtitle: e.target.value }))}
                    placeholder="Enter site subtitle"
                  />
                </div>

                <div>
                  <Label htmlFor="site_description">Site Description</Label>
                  <Textarea
                    id="site_description"
                    value={settings.site_description || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, site_description: e.target.value }))}
                    placeholder="Enter site description for SEO"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="logo_url">Logo URL</Label>
                    <Input
                      id="logo_url"
                      value={settings.logo_url || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, logo_url: e.target.value }))}
                      placeholder="/path/to/logo.png"
                    />
                  </div>

                  <div>
                    <Label htmlFor="favicon_url">Favicon URL</Label>
                    <Input
                      id="favicon_url"
                      value={settings.favicon_url || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, favicon_url: e.target.value }))}
                      placeholder="/path/to/favicon.ico"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => saveSection({
                    site_title: settings.site_title,
                    site_subtitle: settings.site_subtitle,
                    site_description: settings.site_description,
                    logo_url: settings.logo_url,
                    favicon_url: settings.favicon_url,
                  })}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Site Settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center pt-6 border-t">
        <Button variant="outline" onClick={fetchSettings} disabled={loading}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Settings
        </Button>

        <div className="text-sm text-muted-foreground">
          Changes are saved automatically when you click the save buttons in each section.
        </div>
      </div>
    </div>
  );
}