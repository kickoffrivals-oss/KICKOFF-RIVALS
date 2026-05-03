import {
  Home,
  Ticket,
  User,
  Table,
  Wallet,
  Trophy,
  Star,
  Clock,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Settings,
  LogOut,
  Gift,
  Coins,
  Zap,
  Shield,
  Users,
  Share2,
  Copy,
  ExternalLink,
  Loader2,
  AlertCircle,
  Info,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  RefreshCw,
  Search,
  Filter,
  MoreHorizontal,
  MoreVertical,
  Plus,
  Minus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Bell,
  BellOff,
  Mail,
  MessageSquare,
  Send,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Medal,
  Crown,
  Flame,
  Sparkles,
  type LucideProps,
} from "lucide-react";
import { cn } from "../lib/utils";

// Re-export icons with custom names for the app
export const IconHome = Home;
export const IconTicket = Ticket;
export const IconUser = User;
export const IconTable = Table;
export const IconWallet = Wallet;
export const IconTrophy = Trophy;
export const IconStar = Star;
export const IconClock = Clock;
export const IconCheck = Check;
export const IconX = X;
export const IconChevronRight = ChevronRight;
export const IconChevronLeft = ChevronLeft;
export const IconChevronDown = ChevronDown;
export const IconChevronUp = ChevronUp;
export const IconSettings = Settings;
export const IconLogOut = LogOut;
export const IconGift = Gift;
export const IconCoins = Coins;
export const IconZap = Zap;
export const IconShield = Shield;
export const IconUsers = Users;
export const IconShare = Share2;
export const IconCopy = Copy;
export const IconExternalLink = ExternalLink;
export const IconLoader = Loader2;
export const IconAlert = AlertCircle;
export const IconInfo = Info;
export const IconSuccess = CheckCircle2;
export const IconError = XCircle;
export const IconPlay = Play;
export const IconPause = Pause;
export const IconRefresh = RefreshCw;
export const IconSearch = Search;
export const IconFilter = Filter;
export const IconMore = MoreHorizontal;
export const IconMoreVertical = MoreVertical;
export const IconPlus = Plus;
export const IconMinus = Minus;
export const IconEdit = Edit;
export const IconTrash = Trash2;
export const IconEye = Eye;
export const IconEyeOff = EyeOff;
export const IconLock = Lock;
export const IconUnlock = Unlock;
export const IconBell = Bell;
export const IconBellOff = BellOff;
export const IconMail = Mail;
export const IconMessage = MessageSquare;
export const IconSend = Send;
export const IconArrowUp = ArrowUp;
export const IconArrowDown = ArrowDown;
export const IconArrowLeft = ArrowLeft;
export const IconArrowRight = ArrowRight;
export const IconTrendingUp = TrendingUp;
export const IconTrendingDown = TrendingDown;
export const IconBarChart = BarChart3;
export const IconPieChart = PieChart;
export const IconActivity = Activity;
export const IconTarget = Target;
export const IconAward = Award;
export const IconMedal = Medal;
export const IconCrown = Crown;
export const IconFlame = Flame;
export const IconSparkles = Sparkles;

// Custom football/soccer icon
export function IconFootball({ className, ...props }: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-4 w-4", className)}
      width={props.width || 24}
      height={props.height || 24}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

// Custom goal icon
export function IconGoal({ className, ...props }: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-4 w-4", className)}
      width={props.width || 24}
      height={props.height || 24}
      {...props}
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 8h20M2 12h20M2 16h20" />
      <path d="M8 4v16M16 4v16" />
    </svg>
  );
}

// Custom whistle icon
export function IconWhistle({ className, ...props }: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-4 w-4", className)}
      width={props.width || 24}
      height={props.height || 24}
      {...props}
    >
      <path d="M4 15a4 4 0 0 1 4-4h8a4 4 0 0 1 0 8H8a4 4 0 0 1-4-4z" />
      <path d="M16 11V7a4 4 0 0 0-4-4H8" />
      <circle cx="16" cy="15" r="2" />
    </svg>
  );
}

// Custom card icon (for yellow/red cards)
export function IconCard({ className, color = "yellow", ...props }: LucideProps & { color?: "yellow" | "red" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={color === "yellow" ? "#fbbf24" : "#ef4444"}
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-4 w-4", className)}
      width={props.width || 24}
      height={props.height || 24}
      {...props}
    >
      <rect x="6" y="3" width="12" height="18" rx="2" />
    </svg>
  );
}

// Spinner component for loading states
export function Spinner({ className, ...props }: LucideProps) {
  return (
    <Loader2 className={cn("h-4 w-4 animate-spin", className)} {...props} />
  );
}

// Badge icon with count
export function IconBadge({
  count,
  className,
  children,
}: {
  count?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("relative inline-flex", className)}>
      {children}
      {count !== undefined && count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </div>
  );
}
