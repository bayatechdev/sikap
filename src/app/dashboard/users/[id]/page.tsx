'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, User, Mail, Shield, Trash2 } from "lucide-react"
import { FormSkeleton } from "@/components/ui/skeleton-variants"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const roles = [
  { value: 'admin', label: 'Administrator', description: 'Full system access' },
  { value: 'manager', label: 'Manager', description: 'Manage applications and users' },
  { value: 'reviewer', label: 'Reviewer', description: 'Review and approve applications' },
  { value: 'staff', label: 'Staff', description: 'Basic access to applications' }
];

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
}

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff',
    status: 'active' as 'active' | 'inactive',
    newPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchUser = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/real/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }
      const userData = await response.json();
      setUser(userData.user);
      setFormData({
        name: userData.user.name,
        email: userData.user.email,
        role: userData.user.role,
        status: userData.user.status,
        newPassword: ''
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      router.push('/dashboard/users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
      fetchUser(resolved.id);
    };
    resolveParams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (showPasswordReset && formData.newPassword && formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const updateData: {
        name: string;
        email: string;
        role: string;
        status: string;
        password?: string;
      } = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status
      };

      if (showPasswordReset && formData.newPassword) {
        updateData.password = formData.newPassword;
      }

      const response = await fetch(`/api/users/real/${resolvedParams?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      router.push('/dashboard/users?updated=true');
    } catch (error) {
      console.error('Error updating user:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to update user'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/users/real/${resolvedParams?.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      router.push('/dashboard/users?deleted=true');
    } catch (error) {
      console.error('Error deleting user:', error);
      setErrors({
        delete: error instanceof Error ? error.message : 'Failed to delete user'
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <FormSkeleton />;
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-muted-foreground">User not found</p>
          <Link href="/dashboard/users">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/users">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
          <p className="text-muted-foreground">
            Update user information and permissions
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>
                Update basic user information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`pl-10 w-full rounded-md border ${errors.name ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`pl-10 w-full rounded-md border ${errors.email ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                {/* Password Reset Section */}
                <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Password Reset</h3>
                      <p className="text-xs text-muted-foreground">
                        Leave blank to keep current password
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPasswordReset(!showPasswordReset)}
                    >
                      {showPasswordReset ? 'Cancel' : 'Reset Password'}
                    </Button>
                  </div>

                  {showPasswordReset && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter new password"
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange('newPassword', e.target.value)}
                        className={`w-full rounded-md border ${errors.newPassword ? 'border-destructive' : 'border-input'} bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
                      />
                      {errors.newPassword && (
                        <p className="text-sm text-destructive">{errors.newPassword}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Error */}
                {errors.submit && (
                  <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                    {errors.submit}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-2 pt-4">
                  <Link href="/dashboard/users">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Update User
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
                <div>
                  <div className="font-medium">Delete User</div>
                  <div className="text-sm text-muted-foreground">
                    Permanently delete this user account. This action cannot be undone.
                  </div>
                </div>
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </Button>
              </div>
              {errors.delete && (
                <p className="text-sm text-destructive mt-2">{errors.delete}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Role, Status, and Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                Role & Status
              </CardTitle>
              <CardDescription>
                Update user role and account status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium leading-none">
                  User Role *
                </label>
                <div className="space-y-2">
                  {roles.map((role) => (
                    <div
                      key={role.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.role === role.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => handleInputChange('role', role.value)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {role.description}
                          </div>
                        </div>
                        <div className={`w-4 h-4 border-2 rounded-full ${
                          formData.role === role.value
                            ? 'border-primary bg-primary'
                            : 'border-border'
                        }`}>
                          {formData.role === role.value && (
                            <div className="w-full h-full rounded-full bg-background scale-50" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium leading-none">
                  Account Status
                </label>
                <div className="space-y-2">
                  <div
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.status === 'active'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => handleInputChange('status', 'active')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium flex items-center">
                          Active
                          <Badge variant="default" className="ml-2">Active</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          User can login and access the system
                        </div>
                      </div>
                      <div className={`w-4 h-4 border-2 rounded-full ${
                        formData.status === 'active'
                          ? 'border-primary bg-primary'
                          : 'border-border'
                      }`}>
                        {formData.status === 'active' && (
                          <div className="w-full h-full rounded-full bg-background scale-50" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.status === 'inactive'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => handleInputChange('status', 'inactive')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium flex items-center">
                          Inactive
                          <Badge variant="destructive" className="ml-2">Inactive</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          User cannot login (account disabled)
                        </div>
                      </div>
                      <div className={`w-4 h-4 border-2 rounded-full ${
                        formData.status === 'inactive'
                          ? 'border-primary bg-primary'
                          : 'border-border'
                      }`}>
                        {formData.status === 'inactive' && (
                          <div className="w-full h-full rounded-full bg-background scale-50" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium">User ID</div>
                <div className="text-sm text-muted-foreground font-mono">{user.id}</div>
              </div>
              <div>
                <div className="text-sm font-medium">Created</div>
                <div className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</div>
              </div>
              {user.lastLogin && (
                <div>
                  <div className="text-sm font-medium">Last Login</div>
                  <div className="text-sm text-muted-foreground">{formatDate(user.lastLogin)}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}