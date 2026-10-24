import { fireEvent, render, screen } from '@testing-library/react';
import { VehicleCard } from './VehicleCard';
import type { Vehicle } from '../types';

const vehicle: Vehicle = {
  id: 'v1',
  make: 'Toyota',
  model: 'Corolla',
  category: 'Sedan',
  price: 22000,
  quantity: 2,
  createdAt: '',
  updatedAt: '',
};

describe('VehicleCard', () => {
  it('disables the purchase button when the vehicle is sold out', () => {
    render(<VehicleCard vehicle={{ ...vehicle, quantity: 0 }} isAdmin={false} onPurchase={vi.fn()} />);
    expect(screen.getByRole('button', { name: /sold out/i })).toBeDisabled();
  });

  it('calls onPurchase when the vehicle is in stock', () => {
    const onPurchase = vi.fn();
    render(<VehicleCard vehicle={vehicle} isAdmin={false} onPurchase={onPurchase} />);
    fireEvent.click(screen.getByRole('button', { name: /purchase/i }));
    expect(onPurchase).toHaveBeenCalledWith(vehicle);
  });

  it('hides admin controls from regular users', () => {
    render(<VehicleCard vehicle={vehicle} isAdmin={false} onPurchase={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('shows admin controls to admins', () => {
    render(<VehicleCard vehicle={vehicle} isAdmin onPurchase={vi.fn()} />);
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /restock/i })).toBeInTheDocument();
  });
});
