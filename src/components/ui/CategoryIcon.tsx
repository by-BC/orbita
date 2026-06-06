import {
  Utensils, Car, Home, HeartPulse, Gamepad2, Tv,
  GraduationCap, Dumbbell, CreditCard, TrendingUp,
  CircleEllipsis, ShoppingCart, Briefcase, Plane,
  Music, Book, Coffee, Dog, Baby, Gift,
  Zap, Wifi, Phone, Shirt, Wrench, PiggyBank,
  LucideProps,
} from 'lucide-react'

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  'utensils': Utensils,
  'car': Car,
  'home': Home,
  'heart-pulse': HeartPulse,
  'gamepad-2': Gamepad2,
  'tv': Tv,
  'graduation-cap': GraduationCap,
  'dumbbell': Dumbbell,
  'credit-card': CreditCard,
  'trending-up': TrendingUp,
  'circle-ellipsis': CircleEllipsis,
  'shopping-cart': ShoppingCart,
  'briefcase': Briefcase,
  'plane': Plane,
  'music': Music,
  'book': Book,
  'coffee': Coffee,
  'dog': Dog,
  'baby': Baby,
  'gift': Gift,
  'zap': Zap,
  'wifi': Wifi,
  'phone': Phone,
  'shirt': Shirt,
  'wrench': Wrench,
  'piggy-bank': PiggyBank,
}

interface CategoryIconProps {
  icon: string
  color: string
  size?: number
  className?: string
}

export default function CategoryIcon({ icon, color, size = 16, className }: CategoryIconProps) {
  const Icon = iconMap[icon] ?? CircleEllipsis
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl shrink-0 ${className ?? ''}`}
      style={{
        width: size + 16,
        height: size + 16,
        background: color + '20',
      }}
    >
      <Icon size={size} color={color} strokeWidth={2} />
    </span>
  )
}
