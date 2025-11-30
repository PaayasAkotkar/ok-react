import React, { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NextButton } from './nextBtn';
import '@testing-library/jest-dom';

describe('NextButton', () => {
    it('renders the button with default text', () => {
        render(<NextButton />);
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('NEXT');
    })

    it('renders children inside the button', () => {
        render(<NextButton><span>Child</span></NextButton>);
        const button = screen.getByRole('button');
        expect(button).toHaveTextContent('NEXTChild');
    })

    it('forwards ref correctly', () => {
        const ref = createRef<HTMLButtonElement>();
        render(<NextButton ref={ref} />);
        expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    })

    it('calls onClick handler when clicked', () => {
        const handleClick = jest.fn();
        render(<NextButton onClick={handleClick} />);
        const button = screen.getByRole('button');
        fireEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    })
})
