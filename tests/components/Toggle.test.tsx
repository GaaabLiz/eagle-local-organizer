import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toggle } from '../../src/components/common/Toggle';

describe('Toggle', () => {
  it('renders with label', () => {
    render(<Toggle checked={false} onChange={jest.fn()} label="Test toggle" />);
    expect(screen.getByText('Test toggle')).toBeInTheDocument();
  });

  it('calls onChange when clicked', () => {
    const onChange = jest.fn();
    render(<Toggle checked={false} onChange={onChange} label="Toggle" />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('toggles off when checked', () => {
    const onChange = jest.fn();
    render(<Toggle checked={true} onChange={onChange} label="Toggle" />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('does not call onChange when disabled', () => {
    const onChange = jest.fn();
    render(<Toggle checked={false} onChange={onChange} label="Toggle" disabled />);
    fireEvent.click(screen.getByRole('switch'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('responds to keyboard Enter', () => {
    const onChange = jest.fn();
    render(<Toggle checked={false} onChange={onChange} label="Toggle" />);
    fireEvent.keyDown(screen.getByRole('switch'), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('responds to keyboard Space', () => {
    const onChange = jest.fn();
    render(<Toggle checked={false} onChange={onChange} label="Toggle" />);
    fireEvent.keyDown(screen.getByRole('switch'), { key: ' ' });
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('has correct aria attributes', () => {
    render(<Toggle checked={true} onChange={jest.fn()} label="Toggle" />);
    const el = screen.getByRole('switch');
    expect(el).toHaveAttribute('aria-checked', 'true');
    expect(el).toHaveAttribute('aria-label', 'Toggle');
  });
});
