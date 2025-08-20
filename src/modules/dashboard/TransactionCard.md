# TransactionCard Component

A transaction card component that matches the Figma design specifications, featuring a clean layout with transaction details, status badges, and interactive elements.

## Features

- **Status Badges**: Color-coded status indicators (pending, confirmed, released, cancelled, declined)
- **Transaction Types**: Visual distinction between sent and received transactions
- **Amount Display**: Bitcoin amounts with USD equivalents
- **Interactive Design**: Hover effects and click handlers
- **Responsive Layout**: Adapts to different screen sizes
- **Dark Theme**: Matches the application's dark theme
- **Animations**: Smooth Framer Motion animations

## Usage

```tsx
import TransactionCard from '@/modules/dashboard/TransactionCard';

function MyComponent() {
  const handleTransactionClick = (transactionId: string) => {
    console.log('Transaction clicked:', transactionId);
  };

  return (
    <TransactionCard
      title="Software Development Team"
      status="pending"
      date="Jul 20, 03:32 PM"
      type="received"
      amount="0.00416667"
      amountUsd="$250.00"
      fee="0.00000001"
      feeUsd="$0.01"
      total="0.00416668"
      totalUsd="$250.01"
      onClick={() => handleTransactionClick('tx-123')}
    />
  );
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `title` | `string` | Yes | - | Transaction title/description |
| `status` | `'pending' \| 'confirmed' \| 'released' \| 'cancelled' \| 'declined'` | Yes | - | Transaction status |
| `date` | `string` | Yes | - | Transaction date and time |
| `type` | `'sent' \| 'received'` | Yes | - | Transaction type |
| `amount` | `string` | Yes | - | Bitcoin amount |
| `amountUsd` | `string` | Yes | - | USD equivalent of amount |
| `fee` | `string` | No | - | Transaction fee in Bitcoin |
| `feeUsd` | `string` | No | - | Transaction fee in USD |
| `total` | `string` | No | - | Total amount including fee |
| `totalUsd` | `string` | No | - | Total amount in USD |
| `onClick` | `() => void` | No | - | Click handler function |
| `className` | `string` | No | `""` | Additional CSS classes |

## Status Colors

| Status | Background | Text Color |
|--------|------------|------------|
| `pending` | `#FEB64D` (Yellow) | `#0D0D0D` (Dark) |
| `confirmed` | `#00C287` (Green) | White |
| `released` | `#00E19C` (Light Green) | `#0D0D0D` (Dark) |
| `cancelled` | `#FF6B6B` (Red) | White |
| `declined` | `#FF8E53` (Orange) | White |

## Transaction Types

| Type | Color | Icon |
|------|-------|------|
| `received` | `#00C287` (Green) | Arrow Down Left |
| `sent` | `#007AFF` (Blue) | Arrow Up Right (rotated) |

## Design Specifications

The component follows the exact Figma design specifications:

- **Card**: 1166px width, 153px height, 20px border radius
- **Background**: `#222222` with `#303434` border
- **Padding**: 20px (5 in Tailwind)
- **Typography**: White text with proper hierarchy
- **Icons**: Lucide React icons (Eye, ArrowDownLeft, Bitcoin)
- **Colors**: Exact match to design system
- **Hover Effects**: Background change to `#2a2a2a`

## Layout Structure

1. **Top Bar** (50px height)
   - Title and status badge
   - Date and transaction type
   - View button with double eye icons

2. **Details Section** (47px height)
   - 3-column grid layout
   - Amount, Fee, and Total sections
   - Bitcoin icon with orange color (#F9A214)

## Integration

The TransactionCard component is currently integrated into:

1. **Demo Component** (`src/modules/dashboard/TransactionCardDemo.tsx`) - Standalone demo with multiple examples
2. **Dashboard** - Can be used in transaction lists
3. **Transactions Page** - Can replace existing transaction items

## Styling

The component uses Tailwind CSS classes and follows the existing design system:

- **Card**: `bg-[#222222] border-[#303434] rounded-[20px]`
- **Hover**: `hover:bg-[#2a2a2a] transition-colors`
- **Typography**: Consistent with existing components
- **Spacing**: 16px gaps between sections
- **Grid**: Responsive 3-column layout for details

## Accessibility

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly
- High contrast design
- Click handlers for interactive elements

## Animation

- **Entrance**: Fade in with slight upward movement
- **Duration**: 0.3 seconds
- **Easing**: Default Framer Motion easing
- **Hover**: Smooth background color transition
