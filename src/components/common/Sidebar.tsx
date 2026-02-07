import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import ChangePasswordDialog from "@/components/common/ChangePasswordDialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";
import { useInfoStore } from "@/stores/infoStore";
import assets from "@/assets";
import {
	Bell,
	GraduationCap,
	Calendar,
	ClipboardList,
	FileText,
	DollarSign,
	LogOut,
	BookOpen,
	ClipboardCheck,
	PenLine,
	Gift,
	BarChart3,
	IdCard,
	LayoutTemplate,
	MessageSquare,
	Heart,
	Library,
	ArrowLeft,
	Sun,
	Moon,
	Bot,
	X,
	Mail,
	CalendarCheck,
	MoreVertical,
	Pencil,
	KeyRound,
} from "lucide-react";

interface MenuItem {
	name: string;
	path: string;
	icon: React.ElementType;
	specialAction?: () => void;
}

interface MenuGroup {
	title: string;
	items: MenuItem[];
}

interface SidebarProps {
	isOpen: boolean;
	onClose: () => void;
	onLogout: () => void;
}

function Sidebar({ isOpen, onClose, onLogout }: SidebarProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const [isDesktop, setIsDesktop] = useState(false);
	const [showChangePassword, setShowChangePassword] = useState(false);
	const { theme, setTheme } = useTheme();
	const { studentInfo, fetchStudentInfo, getInitials } = useInfoStore();

	const selectedPath = location.pathname;
	const isRegistrationMode = useMemo(() => {
		return (
			location.pathname.includes("/student/registration") &&
			!location.pathname.includes("/student/registration-results")
		);
	}, [location.pathname]);

	// Fetch student info on mount
	useEffect(() => {
		fetchStudentInfo();
	}, [fetchStudentInfo]);

	useEffect(() => {
		const checkScreenSize = () => {
			setIsDesktop(window.innerWidth >= 1024);
		};
		checkScreenSize();
		window.addEventListener("resize", checkScreenSize);
		return () => window.removeEventListener("resize", checkScreenSize);
	}, []);

	const registrationMenu: MenuGroup[] = [
		{
			title: "Đăng ký học phần",
			items: [
				{
					name: "Đăng ký học phần",
					path: "/student/registration",
					icon: PenLine,
				},
				{
					name: "Đăng ký ghi danh",
					path: "/student/registration/plan",
					icon: ClipboardList,
				},
				{
					name: "Tra cứu học phần",
					path: "/student/registration/search",
					icon: BookOpen,
				},
				{
					name: "Lịch sử đăng ký",
					path: "/student/registration/history",
					icon: ClipboardCheck,
				},
			],
		},
	];

	const mainMenu: MenuGroup[] = [
		{
			title: "Thông tin cá nhân",
			items: [
				{ name: "Thông tin sinh viên", path: "/student", icon: IdCard },
				{ name: "Thông báo", path: "/student/notifications", icon: Bell },
			],
		},
		{
			title: "Tra cứu thông tin",
			items: [
				{
					name: "Chương trình đào tạo",
					path: "/student/educational-program",
					icon: LayoutTemplate,
				},
				{
					name: "Thời khóa biểu",
					path: "/student/schedule",
					icon: Calendar,
				},
				{
					name: "Lịch thi",
					path: "/student/exam-schedule",
					icon: ClipboardList,
				},
				{
					name: "Quyết định sinh viên",
					path: "/student/decisions",
					icon: FileText,
				},
				{
					name: "Điểm danh",
					path: "/student/attendance",
					icon: ClipboardCheck,
				},
				{
					name: "Điểm rèn luyện",
					path: "/student/conduct-score",
					icon: BarChart3,
				},
				{
					name: "Kết quả học tập",
					path: "/student/academic-results",
					icon: BookOpen,
				},
				{
					name: "Tài chính sinh viên",
					path: "/student/finance",
					icon: DollarSign,
				},
				{
					name: "Kết quả ĐKHP",
					path: "/student/registration-results",
					icon: PenLine,
				},
				{
					name: "HP tương đương",
					path: "/student/equivalent-courses",
					icon: Library,
				},
			],
		},
		{
			title: "Chức năng trực tuyến",
			items: [
				{ name: "AI Chatbot", path: "/student/chatbot", icon: Bot },
				{
					name: "Đăng ký học phần",
					path: "",
					icon: PenLine,
					specialAction: () => {
						navigate("/student/registration");
					},
				},
				{
					name: "Xét tốt nghiệp",
					path: "/student/graduation",
					icon: GraduationCap,
				},
				{
					name: "Đăng kí thi lại",
					path: "/student/retake",
					icon: CalendarCheck,
				},
				{
					name: "Ý kiến thảo luận",
					path: "/student/discussion",
					icon: MessageSquare,
				},
				{
					name: "Đánh giá ĐRL",
					path: "/student/conduct-assessment",
					icon: BarChart3,
				},
				{ name: "Liên hệ - góp ý", path: "/student/contact", icon: Mail },
				{
					name: "Hoạt động cộng đồng",
					path: "/student/community-service",
					icon: Heart,
				},
				{
					name: "Nộp chứng chỉ",
					path: "/student/certificates",
					icon: Library,
				},
				{ name: "Học bổng", path: "/student/scholarship", icon: Gift },
			],
		},
	];

	const handleNavigation = (path: string, specialAction?: () => void) => {
		if (specialAction) {
			specialAction();
			return;
		}

		if (path.startsWith("http")) {
			window.open(path, "_blank");
			onClose();
			return;
		}

		if (path && path !== selectedPath) {
			navigate(path);
			onClose();
		}
	};

	const handleBackToNormalSidebar = () => {
		navigate("/student");
	};

	const currentMenu = isRegistrationMode ? registrationMenu : mainMenu;

	return (
		<>
			{/* Overlay - only on mobile */}
			{!isDesktop && (
				<div
					className={cn(
						"fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300",
						isOpen ? "opacity-100" : (
							"opacity-0 pointer-events-none"
						),
					)}
					onClick={onClose}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					"fixed left-0 top-0 h-full w-72 bg-card border-r border-border z-50 flex flex-col transition-transform duration-300 ease-in-out",
					isOpen ? "translate-x-0" : "-translate-x-full",
				)}
			>
				{/* Header */}
				<div className='p-4 border-b border-border'>
					<div className='flex items-center gap-3'>
						<img
							src={assets.imageLogo}
							alt='VHU Logo'
							className='w-12 h-12 object-contain cursor-pointer'
							onClick={() => handleNavigation("/home")}
						/>
						<div className='flex-1 min-w-0'>
							<h1
								className='font-bold text-foreground text-sm cursor-pointer hover:text-primary transition-colors truncate'
								onClick={() => handleNavigation("/home")}
							>
								Trường Đại Học Văn Hiến
							</h1>
							<p className='text-xs text-muted-foreground'>
								Cổng thông tin sinh viên
							</p>
						</div>
						<Button
							variant='ghost'
							size='icon'
							className='shrink-0 opacity-0 pointer-events-none'
						>
							<X size={20} />
						</Button>
					</div>
				</div>

				{/* Back Button for Registration Mode */}
				{isRegistrationMode && (
					<div className='p-3 border-b border-border'>
						<Button
							variant='ghost'
							className='w-full justify-start gap-2 text-primary hover:text-primary hover:bg-primary/10'
							onClick={handleBackToNormalSidebar}
						>
							<ArrowLeft size={18} />
							<span>Trở về trang chính</span>
						</Button>
					</div>
				)}

				{/* Menu */}
				<div className='flex-1 overflow-y-auto py-4 px-3 space-y-6'>
					{currentMenu.map((group, groupIndex) => (
						<div key={groupIndex}>
							<h3 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2'>
								{group.title}
							</h3>
							<div className='space-y-1'>
								{group.items.map((item, itemIndex) => {
									const Icon = item.icon;
									const isSelected =
										item.path === selectedPath;

									return (
										<button
											key={itemIndex}
											onClick={() =>
												handleNavigation(
													item.path,
													item.specialAction,
												)
											}
											className={cn(
												"cursor-pointer w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
												isSelected ?
													"bg-primary text-primary-foreground font-medium"
													: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
											)}
										>
											<Icon
												size={18}
												className='shrink-0'
											/>
											<span className='truncate'>
												{item.name}
											</span>
										</button>
									);
								})}
							</div>
						</div>
					))}
				</div>

				{/* Footer */}
				<div className='p-4 border-t border-border'>
					<div className='flex items-center gap-3'>
						{/* Avatar */}
						<Avatar className='h-10 w-10 border-2 border-primary/20'>
							<AvatarFallback className='bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-semibold text-sm'>
								{getInitials()}
							</AvatarFallback>
						</Avatar>

						{/* Info */}
						<div className='flex-1 min-w-0'>
							<p className='text-sm font-semibold text-foreground truncate'>
								{studentInfo?.HoTen || 'Đang tải...'}
							</p>
							<p className='text-xs text-muted-foreground font-mono'>
								{studentInfo?.MaSinhVien || '---'}
							</p>
						</div>

						{/* Dropdown Menu */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant='ghost' size='icon' className='h-8 w-8 shrink-0'>
									<MoreVertical size={18} />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end' className='w-56'>
								<DropdownMenuItem onClick={() => navigate('/student/update')}>
									<Pencil size={16} className='mr-2' />
									Cập nhật thông tin
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setShowChangePassword(true)}>
									<KeyRound size={16} className='mr-2' />
									Đổi mật khẩu
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<div className='px-2 py-1.5'>
									<p className='text-xs text-muted-foreground mb-2'>Giao diện</p>
									<div className='flex items-center gap-1'>
										<Button
											variant={theme === "light" ? "default" : "ghost"}
											size='sm'
											className='flex-1 h-8 gap-1'
											onClick={() => setTheme("light")}
										>
											<Sun size={14} />
											Sáng
										</Button>
										<Button
											variant={theme === "dark" ? "default" : "ghost"}
											size='sm'
											className='flex-1 h-8 gap-1'
											onClick={() => setTheme("dark")}
										>
											<Moon size={14} />
											Tối
										</Button>
									</div>
								</div>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={onLogout}
									className='text-destructive focus:text-destructive focus:bg-destructive/10'
								>
									<LogOut size={16} className='mr-2' />
									Đăng xuất
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</aside>
			<ChangePasswordDialog
				open={showChangePassword}
				onOpenChange={setShowChangePassword}
			/>
		</>
	);
}

export default Sidebar;
