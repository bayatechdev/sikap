// API service layer for hero slides
export interface HeroSlide {
  id: number;
  version: 'split' | 'full';
  order: number;
  isActive: boolean;
  title: string | null;
  subtitle: string | null;
  imagesJson: Array<{
    url: string;
    alt?: string;
  }> | null;
  createdAt: string;
  updatedAt: string;
}

export interface EditingSlide {
  id?: number;
  version: 'split' | 'full';
  order: number;
  isActive: boolean;
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
}

export class HeroSlideAPI {
  // Get all slides
  static async getAllSlides(): Promise<HeroSlide[]> {
    try {
      const response = await fetch('/api/hero-slides');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch slides');
      }

      return data.heroSlides;
    } catch (error) {
      console.error('Error fetching slides:', error);
      throw error;
    }
  }

  // Create new slide
  static async createSlide(slideData: EditingSlide): Promise<HeroSlide> {
    try {
      const payload = {
        version: slideData.version,
        order: slideData.order,
        isActive: slideData.isActive,
        title: slideData.title || null,
        subtitle: slideData.subtitle || null,
        imagesJson: [{
          url: slideData.imageUrl,
          alt: slideData.imageAlt || slideData.title
        }]
      };

      const response = await fetch('/api/hero-slides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create slide');
      }

      return result.heroSlide;
    } catch (error) {
      console.error('Error creating slide:', error);
      throw error;
    }
  }

  // Update existing slide
  static async updateSlide(slideData: EditingSlide): Promise<HeroSlide> {
    if (!slideData.id) {
      throw new Error('Slide ID is required for update');
    }

    try {
      const payload = {
        version: slideData.version,
        order: slideData.order,
        isActive: slideData.isActive,
        title: slideData.title || null,
        subtitle: slideData.subtitle || null,
        imagesJson: [{
          url: slideData.imageUrl,
          alt: slideData.imageAlt || slideData.title
        }]
      };

      const response = await fetch(`/api/hero-slides/${slideData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update slide');
      }

      return result.heroSlide;
    } catch (error) {
      console.error('Error updating slide:', error);
      throw error;
    }
  }

  // Delete slide
  static async deleteSlide(id: number): Promise<void> {
    try {
      const response = await fetch(`/api/hero-slides/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete slide');
      }
    } catch (error) {
      console.error('Error deleting slide:', error);
      throw error;
    }
  }

  // Toggle active status
  static async toggleActive(id: number, isActive: boolean): Promise<HeroSlide> {
    try {
      const response = await fetch(`/api/hero-slides/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error('Failed to toggle slide status');
      }

      return result.heroSlide;
    } catch (error) {
      console.error('Error toggling slide:', error);
      throw error;
    }
  }

  // Reorder slides (swap positions) - Use temporary order to avoid conflicts
  static async reorderSlides(slide1: { id: number; order: number }, slide2: { id: number; order: number }): Promise<HeroSlide[]> {
    try {
      console.log('🔄 Reordering slides:', { slide1, slide2 });

      // Use a temporary order number to avoid conflicts
      const tempOrder = Math.max(slide1.order, slide2.order) + 1000;

      const updates = [
        // Step 1: Move slide1 to temporary order
        fetch(`/api/hero-slides/${slide1.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: tempOrder }),
        }),
      ];

      await Promise.all(updates);
      console.log('✅ Step 1: Moved slide1 to temporary order:', tempOrder);

      // Step 2: Move slide2 to slide1's original order
      await fetch(`/api/hero-slides/${slide2.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: slide1.order }),
      });
      console.log('✅ Step 2: Moved slide2 to slide1\'s original order:', slide1.order);

      // Step 3: Move slide1 to slide2's original order
      await fetch(`/api/hero-slides/${slide1.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: slide2.order }),
      });
      console.log('✅ Step 3: Moved slide1 to slide2\'s original order:', slide2.order);

      console.log('✅ Reorder successful, fetching updated slides...');

      // Return updated slides to ensure UI is in sync
      const updatedSlides = await this.getAllSlides();
      console.log('✅ Updated slides fetched:', updatedSlides.map(s => ({ id: s.id, order: s.order })));

      return updatedSlides;
    } catch (error) {
      console.error('❌ Error reordering slide:', error);
      throw error;
    }
  }
}