import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '../../src/components/common/ProgressBar';

describe('ProgressBar', () => {
  it('renders with correct progress width', () => {
    render(<ProgressBar progress={50} />);
    const fill = screen.getByRole('progressbar');
    expect(fill).toHaveAttribute('aria-valuenow', '50');
  });

  it('clamps progress to 0 minimum', () => {
    render(<ProgressBar progress={-20} />);
    const fill = screen.getByRole('progressbar');
    expect(fill).toHaveAttribute('aria-valuenow', '0');
  });

  it('clamps progress to 100 maximum', () => {
    render(<ProgressBar progress={150} />);
    const fill = screen.getByRole('progressbar');
    expect(fill).toHaveAttribute('aria-valuenow', '100');
  });

  it('has correct aria range attributes', () => {
    render(<ProgressBar progress={75} />);
    const fill = screen.getByRole('progressbar');
    expect(fill).toHaveAttribute('aria-valuemin', '0');
    expect(fill).toHaveAttribute('aria-valuemax', '100');
  });

  it('applies custom className', () => {
    const { container } = render(<ProgressBar progress={30} className="custom" />);
    expect(container.firstChild).toHaveClass('custom');
  });
});
