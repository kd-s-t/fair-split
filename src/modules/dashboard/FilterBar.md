# FilterBar Component

A responsive filter bar component that matches the Figma design specifications, featuring a search input, category and status dropdowns, and a refresh button with settings icon.

## Features

- **Search Bar**: Full-width search input with search icon
- **Category Filter**: Dropdown to filter by transaction categories
- **Status Filter**: Dropdown to filter by transaction status
- **Refresh Button**: Button with refresh and settings icons
- **Responsive Design**: Adapts to different screen sizes
- **Dark Theme**: Matches the application's dark theme
- **Customizable**: Accepts custom props for all functionality

## Usage

```tsx
import FilterBar from '@/modules/dashboard/FilterBar';

function MyComponent() {
  const handleSearchChange = (value: string) => {
    console.log('Search term:', value);
  };

  const handleCategoryChange = (value: string) => {
    console.log('Category filter:', value);
  };

  const handleStatusChange = (value: string) => {
    console.log('Status filter:', value);
  };

  const handleRefresh = () => {
    console.log('Refresh clicked');
  };

  return (
    <FilterBar
      onSearchChange={handleSearchChange}
      onCategoryChange={handleCategoryChange}
      onStatusChange={handleStatusChange}
      onRefresh={handleRefresh}
      searchPlaceholder="Search escrows..."
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSearchChange` | `(value: string) => void` | `undefined` | Callback when search input changes |
| `onCategoryChange` | `(value: string) => void` | `undefined` | Callback when category filter changes |
| `onStatusChange` | `(value: string) => void` | `undefined` | Callback when status filter changes |
| `onRefresh` | `() => void` | `undefined` | Callback when refresh button is clicked |
| `searchPlaceholder` | `string` | `"Search transactions..."` | Placeholder text for search input |
| `className` | `string` | `""` | Additional CSS classes |

## Filter Options

### Category Filter
- All categories
- Sent
- Received
- Pending
- Completed

### Status Filter
- All status
- Pending
- Active (confirmed)
- Released
- Cancelled
- Declined

## Design Specifications

The component follows the exact Figma design specifications:

- **Search Bar**: 719px width, 40px height, rounded corners (10px)
- **Category Select**: 156px width, 40px height
- **Status Select**: 139px width, 40px height
- **Refresh Button**: 104px width, 40px height
- **Colors**: Dark theme with `#222222` background, `#303434` borders
- **Focus States**: Yellow accent color (`#FEB64D`) on focus
- **Icons**: Lucide React icons (Search, RotateCcw, Settings)

## Integration

The FilterBar component is currently integrated into:

1. **Dashboard Stats** (`src/modules/dashboard/Stats.tsx`) - Shows above the statistics cards
2. **Demo Component** (`src/modules/dashboard/FilterBarDemo.tsx`) - Standalone demo with mock data

## Styling

The component uses Tailwind CSS classes and follows the existing design system:

- Background: `bg-[#222222]` for search, `bg-[#09090B]` for selects
- Borders: `border-[#303434]` with focus state `border-[#FEB64D]`
- Text: White text with `#BCBCBC` placeholder color
- Hover states: Subtle background changes for interactive elements

## Accessibility

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly
- High contrast design
