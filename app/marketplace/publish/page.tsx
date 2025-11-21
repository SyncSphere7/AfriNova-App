/**
 * Seller Dashboard
 * Manage app listings and view sales analytics
 */

'use client';

import { useState, useEffect } from 'react';
import {
  getSellerApps,
  getSellerStats,
  createApp,
  updateApp,
  submitAppForReview,
  type MarketplaceApp,
  type AppCategory,
} from '@/lib/services/marketplace';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCurrency } from '@/lib/utils/currency-context';
import { PriceDisplay } from '@/components/marketplace/price-display';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Package,
  DollarSign,
  Download,
  Star,
  Plus,
  Edit,
  Eye,
  Send,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const CATEGORIES: { value: AppCategory; label: string; icon: string }[] = [
  { value: 'saas', label: 'SaaS', icon: '💼' },
  { value: 'ecommerce', label: 'E-Commerce', icon: '🛒' },
  { value: 'blog', label: 'Blog', icon: '📝' },
  { value: 'portfolio', label: 'Portfolio', icon: '🎨' },
  { value: 'social', label: 'Social', icon: '👥' },
  { value: 'dashboard', label: 'Dashboard', icon: '📊' },
  { value: 'landing', label: 'Landing Page', icon: '🚀' },
  { value: 'mobile', label: 'Mobile', icon: '📱' },
  { value: 'ai', label: 'AI/ML', icon: '🤖' },
  { value: 'other', label: 'Other', icon: '📦' },
];

export default function PublishPage() {
  const { currency, formatPrice } = useCurrency();
  const [apps, setApps] = useState<MarketplaceApp[]>([]);
  const [stats, setStats] = useState({
    totalApps: 0,
    totalDownloads: 0,
    totalRevenue: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Create app form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    category: 'other' as AppCategory,
    icon: '📦',
    price: 0,
    techStack: '',
    features: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appsData, statsData] = await Promise.all([
        getSellerApps(),
        getSellerStats(),
      ]);
      setApps(appsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load seller data:', error);
      toast.error('Failed to load seller data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApp = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.slug || !formData.tagline) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Generate slug from name if not provided
      const slug =
        formData.slug ||
        formData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

      // Parse arrays
      const techStack = formData.techStack
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const features = formData.features
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      await createApp({
        name: formData.name,
        slug,
        tagline: formData.tagline,
        description: formData.description,
        category: formData.category,
        icon: formData.icon,
        price: formData.price,
        tech_stack: techStack,
        features,
        template_files: {}, // Empty for now, can be added later
      });

      toast.success('✅ App created successfully!');
      setShowCreateDialog(false);
      loadData();

      // Reset form
      setFormData({
        name: '',
        slug: '',
        tagline: '',
        description: '',
        category: 'other',
        icon: '📦',
        price: 0,
        techStack: '',
        features: '',
      });
    } catch (error) {
      console.error('Failed to create app:', error);
      toast.error('Failed to create app');
    }
  };

  const handleSubmitForReview = async (appId: string) => {
    try {
      await submitAppForReview(appId);
      toast.success('✅ App submitted for review!');
      loadData();
    } catch (error) {
      console.error('Failed to submit app:', error);
      toast.error('Failed to submit app for review');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <Badge
            variant="outline"
            className="border-2 border-gray-500 bg-gray-500/20 uppercase font-pixel text-xs"
          >
            Draft
          </Badge>
        );
      case 'pending_review':
        return (
          <Badge
            variant="outline"
            className="border-2 border-yellow-500 bg-yellow-500/20 uppercase font-pixel text-xs"
          >
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge
            variant="outline"
            className="border-2 border-green-500 bg-green-500/20 uppercase font-pixel text-xs"
          >
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge
            variant="outline"
            className="border-2 border-red-500 bg-red-500/20 uppercase font-pixel text-xs"
          >
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="border-2 border-foreground p-8 text-center">
          Loading...
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-pixel text-4xl uppercase mb-4">
            💼 Seller Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your app listings and track sales performance.
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="border-2 uppercase font-pixel">
              <Plus className="w-4 h-4 mr-2" />
              New App
            </Button>
          </DialogTrigger>
          <DialogContent className="border-2 border-foreground max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-pixel uppercase">
                Create New App
              </DialogTitle>
              <DialogDescription>
                Fill in the details to create a new app listing. You can edit
                these later.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">
                  App Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  className="border-2"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="My Awesome App"
                />
              </div>

              <div>
                <Label htmlFor="slug">
                  URL Slug <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="slug"
                  className="border-2 font-mono"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="my-awesome-app"
                />
              </div>

              <div>
                <Label htmlFor="tagline">
                  Tagline <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="tagline"
                  className="border-2"
                  value={formData.tagline}
                  onChange={(e) =>
                    setFormData({ ...formData, tagline: e.target.value })
                  }
                  placeholder="A short description of your app"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  className="border-2 min-h-[100px]"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Full description of your app..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: AppCategory) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger className="border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="icon">Icon (Emoji)</Label>
                  <Input
                    id="icon"
                    className="border-2 text-2xl text-center"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    placeholder="📦"
                    maxLength={2}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="price">Price (USD)</Label>
                <Input
                  id="price"
                  type="number"
                  className="border-2 font-mono"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                  min="0"
                  step="1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Set to 0 for free apps. Price in USD will be converted to buyer's currency.
                </p>
              </div>
              </div>

              <div>
                <Label htmlFor="techStack">Tech Stack</Label>
                <Input
                  id="techStack"
                  className="border-2 font-mono"
                  value={formData.techStack}
                  onChange={(e) =>
                    setFormData({ ...formData, techStack: e.target.value })
                  }
                  placeholder="Next.js, TypeScript, Tailwind CSS"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Comma-separated list
                </p>
              </div>

              <div>
                <Label htmlFor="features">Features</Label>
                <Textarea
                  id="features"
                  className="border-2 min-h-[100px] font-mono"
                  value={formData.features}
                  onChange={(e) =>
                    setFormData({ ...formData, features: e.target.value })
                  }
                  placeholder="Authentication&#10;Dashboard&#10;API Integration"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  One feature per line
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                className="border-2 uppercase font-pixel text-xs"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="border-2 uppercase font-pixel text-xs"
                onClick={handleCreateApp}
              >
                Create App
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="border-2 border-foreground p-4 text-center">
          <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
          <div className="font-pixel text-2xl mb-1">{stats.totalApps}</div>
          <div className="text-xs text-muted-foreground uppercase">
            Total Apps
          </div>
        </Card>
        <Card className="border-2 border-foreground p-4 text-center">
          <Download className="w-8 h-8 mx-auto mb-2 text-green-500" />
          <div className="font-pixel text-2xl mb-1">
            {stats.totalDownloads}
          </div>
          <div className="text-xs text-muted-foreground uppercase">
            Downloads
          </div>
        <Card className="border-2 border-foreground p-4 text-center">
          <DollarSign className="w-8 h-8 mx-auto mb-2 text-blue-500" />
          <div className="font-pixel text-2xl mb-1">
            {formatPrice(stats.totalRevenue, true)}
          </div>
          <div className="text-xs text-muted-foreground uppercase">
            Revenue
          </div>
        </Card>
        <Card className="border-2 border-foreground p-4 text-center">
          <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
          <div className="font-pixel text-2xl mb-1">
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="text-xs text-muted-foreground uppercase">
            Avg Rating
          </div>
        </Card>
      </div>

      {/* Apps List */}
      <Card className="border-2 border-foreground overflow-hidden">
        <div className="p-4 bg-muted border-b-2 border-foreground">
          <h2 className="font-pixel text-lg uppercase">Your Apps</h2>
        </div>
        {apps.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="font-pixel text-lg uppercase mb-2">No Apps Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first app to start selling on the marketplace.
            </p>
            <Button
              className="border-2 uppercase font-pixel"
              onClick={() => setShowCreateDialog(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create App
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-foreground">
                <TableHead className="font-pixel uppercase">App</TableHead>
                <TableHead className="font-pixel uppercase">Status</TableHead>
                <TableHead className="font-pixel uppercase text-right">
                  Price
                </TableHead>
                <TableHead className="font-pixel uppercase text-right">
                  Rating
                </TableHead>
                <TableHead className="font-pixel uppercase text-right">
                  Downloads
                </TableHead>
                <TableHead className="font-pixel uppercase text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map((app) => (
                <TableRow key={app.id} className="border-b border-muted">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{app.icon}</div>
                      <div>
                        <div className="font-medium">{app.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {app.tagline}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell className="text-right font-mono">
                    <PriceDisplay 
                      priceUSD={app.price}
                      isFree={app.is_free}
                      showCode={false}
                    />
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {app.rating_average > 0 ? (
                      <div className="flex items-center justify-end gap-1">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        {app.rating_average.toFixed(1)}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {app.downloads_count}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/marketplace/${app.slug}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      {app.status === 'draft' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleSubmitForReview(app.id)}
                        >
                          <Send className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Tips */}
      <Card className="border-2 border-foreground p-6 mt-8">
        <h3 className="font-pixel text-lg uppercase mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Seller Tips
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Quality Code:</strong> Ensure your templates are
              well-documented and follow best practices
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Screenshots:</strong> Add high-quality screenshots and a
              demo URL to increase sales
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Pricing:</strong> Consider offering a free starter version
              to build reputation
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Updates:</strong> Regularly update your templates to keep
              customers happy
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>
              <strong>Support:</strong> Respond to reviews and provide excellent
              customer support
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
