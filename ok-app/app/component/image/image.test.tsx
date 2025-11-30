import { render, screen } from '@testing-library/react';
import ImagePlayground from './image';

describe('ImagePlayground', () => {
    it('renders the main image with correct src and title', () => {
        render(<ImagePlayground />);

        // Check the first image (imgs[0])
        const mainImg = screen.getByRole('img', { name: '' }) as HTMLImageElement; // first img has empty alt
        expect(mainImg).toBeInTheDocument();
        expect(mainImg.src).toContain('/dummy/d1.jpg');
    });

    it('renders other images with correct src and titles', () => {
        render(<ImagePlayground />);

        // The rest of the images start from index 1
        const otherImages = screen.getAllByRole('img') as HTMLImageElement[]; // skip main image

        otherImages.forEach((img, index) => {
            const expectedIndex = index + 1;
            expect(img.src).toContain(`/dummy/d${expectedIndex}.jpg`);
        });

        // Check that titles are rendered
        for (let i = 2; i <= 7; i++) {
            expect(screen.getByText(`d${i}`)).toBeInTheDocument();
        }
    });
});
