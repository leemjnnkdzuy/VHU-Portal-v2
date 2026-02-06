import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	getStudyPrograms,
	getStudyProgramResults,
	getStudyProgramResultsByCurriculum,
	getGradeNotes,
	type StudyProgram,
	type GradeNote,
} from "@/services/academicService";
import {
	Loader2,
	AlertCircle,
	BookOpen,
	GraduationCap,
	TrendingUp,
	Award,
	ChevronDown,
	ChevronUp,
	Check,
	X,
	List,
	Table,
	BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import GradeStatistics from "@/components/common/GradeStatistics";

interface CourseResult {
	CurriculumID: string;
	CurriculumName: string;
	Credits: string;
	DiemTK_10: string;
	DiemTK_4: string;
	DiemTK_Chu: string;
	IsPass: string;
	Note?: string;
	NotComputeAverageScore?: boolean;
	TB_HK?: string;
	TB_HK4?: string;
	TB_TL_HK?: string;
	TB_TL_HK4?: string;
	Dat_TL_HK?: string;
	TongTC_DK_HK?: string;
	StudentID?: string;
	StudentName?: string;
	YearStudy?: string;
	TermID?: string;
	StudyUnitID?: string;
	CurriculumGroupID?: string;
	OlogyName?: string;
	CurriculumNamePrint?: string;
	EnglishCurriculumName?: string;
	ListOfProfessorName?: string;
	DiemRenLuyenHK?: string;
	ScheduleStudyUnitID?: string;
}

interface SemesterData {
	HocKy: string;
	DanhSachDiemHK: CourseResult[];
}

interface YearData {
	NamHoc: string;
	DanhSachDiem: SemesterData[];
}

interface GPA {
	semesterGPA10?: number;
	semesterGPA4?: number;
	cumulativeGPA10?: number;
	cumulativeGPA4?: number;
	creditsEarned?: number;
	totalCreditsRegistered?: number;
}

function AcademicResultsPage() {
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]);
	const [gradeNotes, setGradeNotes] = useState<GradeNote[]>([]);
	const [yearlyResults, setYearlyResults] = useState<YearData[]>([]);
	const [expandedSemesters, setExpandedSemesters] = useState<
		Record<string, boolean>
	>({});
	const [gpa, setGPA] = useState<GPA>({});
	const [viewMode, setViewMode] = useState<"program" | "curriculum">(
		"program",
	);
	const [selectedCourse, setSelectedCourse] = useState<CourseResult | null>(
		null,
	);
	const [activeTab, setActiveTab] = useState<"results" | "statistics">(
		"results",
	);

	useEffect(() => {
		const fetchInitialData = async () => {
			try {
				const [programs, notes] = await Promise.all([
					getStudyPrograms(),
					getGradeNotes(),
				]);
				setStudyPrograms(programs || []);
				setGradeNotes(notes || []);
			} catch (err) {
				console.error("Error:", err);
				setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
			}
		};
		fetchInitialData();
	}, []);

	useEffect(() => {
		const fetchResults = async () => {
			if (studyPrograms.length === 0) return;

			setIsLoading(true);
			try {
				const data =
					viewMode === "program" ?
						await getStudyProgramResults(
							studyPrograms[0].StudyProgramID,
						)
						: await getStudyProgramResultsByCurriculum(
							studyPrograms[0].StudyProgramID,
						);

				if (Array.isArray(data) && data.length > 0) {
					setYearlyResults(data as YearData[]);

					// Expand all semesters by default
					const expanded: Record<string, boolean> = {};
					data.forEach((year: YearData) => {
						year.DanhSachDiem?.forEach((semester: SemesterData) => {
							const key = `${year.NamHoc}-${semester.HocKy}`;
							expanded[key] = true;
						});
					});
					setExpandedSemesters(expanded);

					// Get GPA from the latest semester
					const latestYear = data[data.length - 1] as YearData;
					const latestSemester =
						latestYear?.DanhSachDiem?.[
						latestYear.DanhSachDiem.length - 1
						];
					const latestCourse = latestSemester?.DanhSachDiemHK?.[0];

					if (latestCourse) {
						setGPA({
							semesterGPA10: parseFloat(
								latestCourse.TB_HK || "0",
							),
							semesterGPA4: parseFloat(
								latestCourse.TB_HK4 || "0",
							),
							cumulativeGPA10: parseFloat(
								latestCourse.TB_TL_HK || "0",
							),
							cumulativeGPA4: parseFloat(
								latestCourse.TB_TL_HK4 || "0",
							),
							creditsEarned: parseInt(
								latestCourse.Dat_TL_HK || "0",
							),
							totalCreditsRegistered: parseInt(
								latestCourse.TongTC_DK_HK || "0",
							),
						});
					}
				}
			} catch (err) {
				console.error("Error:", err);
				setError("Không thể tải kết quả học tập.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchResults();
	}, [studyPrograms, viewMode]);

	const toggleSemester = (key: string) => {
		setExpandedSemesters((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	const getGradeColor = (grade: string | null | undefined) => {
		if (!grade) return "text-muted-foreground";
		const g = grade.toUpperCase();
		if (g === "A" || g === "A+")
			return "text-green-600 dark:text-green-400 bg-green-500/10";
		if (g === "B" || g === "B+")
			return "text-blue-600 dark:text-blue-400 bg-blue-500/10";
		if (g === "C" || g === "C+")
			return "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10";
		if (g === "D" || g === "D+")
			return "text-orange-600 dark:text-orange-400 bg-orange-500/10";
		if (g.startsWith("F"))
			return "text-red-600 dark:text-red-400 bg-red-500/10";
		return "text-muted-foreground bg-muted";
	};

	const getSemesterLabel = (hocKy: string) => {
		switch (hocKy) {
			case "HK01":
				return "Học kỳ 1";
			case "HK02":
				return "Học kỳ 2";
			case "HK03":
				return "Học kỳ Hè";
			default:
				return hocKy;
		}
	};

	const cleanCourseName = (name: string) => {
		// Remove HTML tags from course names
		return name.replace(/<[^>]*>/g, "").trim();
	};

	const handleRetry = () => {
		setError(null);
		// Trigger refetch by toggling a value
		setViewMode(viewMode);
	};

	if (isLoading && studyPrograms.length === 0) {
		return (
			<div className='flex items-center justify-center min-h-[60vh]'>
				<div className='text-center space-y-4'>
					<Loader2 className='w-12 h-12 animate-spin text-primary mx-auto' />
					<p className='text-muted-foreground'>
						Đang tải kết quả học tập...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex items-center justify-center min-h-[60vh]'>
				<Card className='max-w-md w-full border-destructive/50'>
					<CardContent className='pt-6'>
						<div className='text-center space-y-4'>
							<AlertCircle className='w-12 h-12 text-destructive mx-auto' />
							<p className='text-destructive'>{error}</p>
							<Button onClick={handleRetry} variant='outline'>
								Thử lại
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='space-y-4'>
				<div>
					<h1 className='text-2xl md:text-3xl font-bold text-foreground'>
						Kết quả học tập
					</h1>
					<p className='text-sm text-muted-foreground'>
						Xem điểm và kết quả học tập qua các học kỳ
					</p>
				</div>
				{/* Controls */}
				<div className='flex flex-col sm:flex-row gap-3'>
					{/* View Mode Tabs */}
					<div className='flex items-center gap-1 p-1 bg-muted rounded-lg flex-1 sm:flex-initial h-10'>
						<Button
							variant={
								viewMode === "program" ? "default" : "ghost"
							}
							size='sm'
							onClick={() => setViewMode("program")}
							disabled={isLoading}
							className={cn(
								"gap-2 transition-all flex-1 sm:flex-initial h-8",
								viewMode === "program" ? "shadow-sm" : (
									"hover:bg-background/50"
								),
							)}
						>
							<List className='w-4 h-4' />
							<span>Theo lộ trình</span>
						</Button>
						<Button
							variant={
								viewMode === "curriculum" ? "default" : "ghost"
							}
							size='sm'
							onClick={() => setViewMode("curriculum")}
							disabled={isLoading}
							className={cn(
								"gap-2 transition-all flex-1 sm:flex-initial h-8",
								viewMode === "curriculum" ? "shadow-sm" : (
									"hover:bg-background/50"
								),
							)}
						>
							<Table className='w-4 h-4' />
							<span>Theo CT</span>
						</Button>
					</div>
					{/* Statistics Toggle Button */}
					<Button
						variant={
							activeTab === "statistics" ? "default" : "outline"
						}
						size='sm'
						onClick={() =>
							setActiveTab(
								activeTab === "statistics" ? "results" : (
									"statistics"
								),
							)
						}
						disabled={isLoading || yearlyResults.length === 0}
						className='gap-2 h-10'
					>
						<BarChart3 className='w-4 h-4' />
						<span>
							{activeTab === "statistics" ?
								"Xem kết quả"
								: "Thống kê"}
						</span>
					</Button>
				</div>
			</div>

			{/* Summary Cards */}
			<div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4'>
				<Card className='border-0 shadow-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground'>
					<CardContent className='p-3 sm:p-5'>
						<div className='flex items-start justify-between'>
							<div>
								<p className='text-primary-foreground/70 text-[10px] sm:text-xs'>
									GPA Tích lũy
								</p>
								<div className='flex items-baseline gap-1 sm:gap-2 mt-1'>
									<p className='text-2xl sm:text-3xl font-bold'>
										{gpa.cumulativeGPA4?.toFixed(2) || "—"}
									</p>
									<span className='text-xs sm:text-sm text-primary-foreground/80'>
										/4.0
									</span>
								</div>
								<p className='text-primary-foreground/70 text-[10px] sm:text-xs mt-1'>
									({gpa.cumulativeGPA10?.toFixed(2) || "—"}
									/10)
								</p>
							</div>
							<div className='p-2 sm:p-3 bg-white/20 rounded-full'>
								<GraduationCap className='w-5 h-5 sm:w-6 sm:h-6' />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className='border shadow-lg'>
					<CardContent className='p-3 sm:p-5'>
						<div className='flex items-start justify-between'>
							<div>
								<p className='text-muted-foreground text-[10px] sm:text-xs'>
									GPA Học kỳ
								</p>
								<div className='flex items-baseline gap-1 sm:gap-2 mt-1'>
									<p className='text-2xl sm:text-3xl font-bold text-foreground'>
										{gpa.semesterGPA4?.toFixed(2) || "—"}
									</p>
									<span className='text-xs sm:text-sm text-muted-foreground'>
										/4.0
									</span>
								</div>
								<p className='text-muted-foreground text-[10px] sm:text-xs mt-1'>
									({gpa.semesterGPA10?.toFixed(2) || "—"}/10)
								</p>
							</div>
							<div className='p-2 sm:p-3 bg-muted rounded-full'>
								<TrendingUp className='w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground' />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className='border shadow-lg'>
					<CardContent className='p-3 sm:p-5'>
						<div className='flex items-start justify-between'>
							<div>
								<p className='text-muted-foreground text-[10px] sm:text-xs'>
									Tín chỉ tích lũy
								</p>
								<p className='text-2xl sm:text-3xl font-bold mt-1 text-foreground'>
									{gpa.creditsEarned || "—"}
								</p>
								<p className='text-muted-foreground text-[10px] sm:text-xs mt-1'>
									Đã đạt
								</p>
							</div>
							<div className='p-2 sm:p-3 bg-muted rounded-full'>
								<Award className='w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground' />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className='border shadow-lg'>
					<CardContent className='p-3 sm:p-5'>
						<div className='flex items-start justify-between'>
							<div>
								<p className='text-muted-foreground text-[10px] sm:text-xs'>
									Tổng số năm học
								</p>
								<p className='text-2xl sm:text-3xl font-bold mt-1 text-foreground'>
									{yearlyResults.length || "—"}
								</p>
								<p className='text-muted-foreground text-[10px] sm:text-xs mt-1'>
									Năm học
								</p>
							</div>
							<div className='p-2 sm:p-3 bg-muted rounded-full'>
								<BookOpen className='w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground' />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Grade Notes - Compact horizontal display */}
			{gradeNotes.length > 0 && (
				<div className='flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin'>
					<span className='text-xs text-muted-foreground shrink-0'>Ghi chú:</span>
					<div className='flex items-center gap-1.5'>
						{gradeNotes.map((note) => (
							<div
								key={note.DiemChu}
								className={cn(
									"px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 border",
									getGradeColor(note.DiemChu),
								)}
								title={note.TenDiem}
							>
								<span className='font-bold'>{note.DiemChu}</span>
								<span className='sm:inline text-[10px] opacity-80 ml-1'>({note.TenDiem})</span>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Results by Year or Statistics */}
			{activeTab === "statistics" ?
				<GradeStatistics
					yearlyResults={yearlyResults}
					gpa={{
						cumulativeGPA10: gpa.cumulativeGPA10,
						cumulativeGPA4: gpa.cumulativeGPA4,
						creditsEarned: gpa.creditsEarned,
					}}
				/>
				: isLoading ?
					<div className='flex items-center justify-center py-12'>
						<Loader2 className='w-8 h-8 animate-spin text-primary' />
					</div>
					: yearlyResults.length === 0 ?
						<Card className='border-0 shadow-lg'>
							<CardContent className='py-12'>
								<div className='text-center'>
									<BookOpen className='w-16 h-16 text-muted-foreground/30 mx-auto mb-4' />
									<p className='text-muted-foreground'>
										Chưa có dữ liệu kết quả học tập
									</p>
								</div>
							</CardContent>
						</Card>
						: <div className='space-y-6'>
							{yearlyResults.map((year) => (
								<Card
									key={year.NamHoc}
									className='border-0 shadow-lg overflow-hidden p-0'
								>
									<CardHeader className='bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-3 px-4'>
										<CardTitle className='flex items-center gap-2 text-lg'>
											<GraduationCap className='h-5 w-5' />
											Năm học {year.NamHoc}
										</CardTitle>
									</CardHeader>
									<CardContent className='p-0'>
										<div className='divide-y divide-border'>
											{year.DanhSachDiem?.map((semester) => {
												const key = `${year.NamHoc}-${semester.HocKy}`;
												const isExpanded =
													expandedSemesters[key];
												const passedCourses =
													semester.DanhSachDiemHK?.filter(
														(c) => c.IsPass === "1",
													).length || 0;
												const totalCourses =
													semester.DanhSachDiemHK?.length ||
													0;

												return (
													<div key={key}>
														<button
															onClick={() =>
																toggleSemester(key)
															}
															className='w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors'
														>
															<div className='flex items-center gap-3'>
																<div className='p-2 bg-primary/10 rounded-lg'>
																	<BookOpen className='w-4 h-4 text-primary' />
																</div>
																<div className='text-left'>
																	<p className='font-semibold text-foreground'>
																		{getSemesterLabel(
																			semester.HocKy,
																		)}
																	</p>
																	<p className='text-xs text-muted-foreground'>
																		{passedCourses}/
																		{totalCourses}{" "}
																		môn đạt
																	</p>
																</div>
															</div>
															{isExpanded ?
																<ChevronUp className='w-5 h-5 text-muted-foreground' />
																: <ChevronDown className='w-5 h-5 text-muted-foreground' />
															}
														</button>

														{isExpanded && (
															<div className='px-4 pb-4'>
																{/* Desktop Table */}
																<div className='hidden md:block overflow-x-auto rounded-lg border'>
																	<table className='w-full'>
																		<thead>
																			<tr className='bg-muted/50'>
																				<th className='text-left py-2.5 px-3 text-xs font-semibold text-muted-foreground'>
																					Mã
																					môn
																				</th>
																				<th className='text-left py-2.5 px-3 text-xs font-semibold text-muted-foreground'>
																					Tên
																					môn
																					học
																				</th>
																				<th className='text-center py-2.5 px-3 text-xs font-semibold text-muted-foreground'>
																					TC
																				</th>
																				<th className='text-center py-2.5 px-3 text-xs font-semibold text-muted-foreground'>
																					Điểm
																					10
																				</th>
																				<th className='text-center py-2.5 px-3 text-xs font-semibold text-muted-foreground'>
																					Điểm
																					4
																				</th>
																				<th className='text-center py-2.5 px-3 text-xs font-semibold text-muted-foreground'>
																					Điểm
																					chữ
																				</th>
																				<th className='text-center py-2.5 px-3 text-xs font-semibold text-muted-foreground'>
																					Đạt
																				</th>
																			</tr>
																		</thead>
																		<tbody className='divide-y divide-border'>
																			{semester.DanhSachDiemHK?.map(
																				(
																					course,
																					idx,
																				) => (
																					<tr
																						key={`${course.CurriculumID}-${idx}`}
																						onClick={() =>
																							setSelectedCourse(
																								course,
																							)
																						}
																						className={cn(
																							"hover:bg-muted/30 transition-colors cursor-pointer",
																							course.IsPass ===
																							"0" &&
																							"bg-red-500/5",
																						)}
																					>
																						<td className='py-2.5 px-3 text-sm font-medium text-foreground'>
																							{
																								course.CurriculumID
																							}
																						</td>
																						<td className='py-2.5 px-3 text-sm text-foreground'>
																							<div>
																								{cleanCourseName(
																									course.CurriculumName,
																								)}
																								{course.NotComputeAverageScore && (
																									<span className='ml-1 text-xs text-muted-foreground'>
																										*
																									</span>
																								)}
																							</div>
																							{course.Note && (
																								<p className='text-xs text-muted-foreground'>
																									{
																										course.Note
																									}
																								</p>
																							)}
																						</td>
																						<td className='py-2.5 px-3 text-sm text-center text-muted-foreground'>
																							{
																								course.Credits
																							}
																						</td>
																						<td className='py-2.5 px-3 text-sm text-center font-medium text-foreground'>
																							{
																								course.DiemTK_10
																							}
																						</td>
																						<td className='py-2.5 px-3 text-sm text-center text-foreground'>
																							{
																								course.DiemTK_4
																							}
																						</td>
																						<td className='py-2.5 px-3 text-center'>
																							<span
																								className={cn(
																									"inline-block px-2 py-0.5 rounded text-xs font-bold",
																									getGradeColor(
																										course.DiemTK_Chu,
																									),
																								)}
																							>
																								{course.DiemTK_Chu ||
																									"—"}
																							</span>
																						</td>
																						<td className='py-2.5 px-3 text-center'>
																							{(
																								course.IsPass ===
																								"1"
																							) ?
																								<Check className='w-4 h-4 text-green-600 dark:text-green-400 mx-auto' />
																								: <X className='w-4 h-4 text-red-600 dark:text-red-400 mx-auto' />
																							}
																						</td>
																					</tr>
																				),
																			)}
																		</tbody>
																	</table>
																</div>

																{/* Mobile Cards */}
																<div className='md:hidden space-y-2'>
																	{semester.DanhSachDiemHK?.map(
																		(
																			course,
																			idx,
																		) => (
																			<div
																				key={`${course.CurriculumID}-${idx}`}
																				onClick={() =>
																					setSelectedCourse(
																						course,
																					)
																				}
																				className={cn(
																					"p-3 rounded-lg border bg-card cursor-pointer hover:bg-muted/50 transition-colors",
																					course.IsPass ===
																					"0" &&
																					"border-red-500/50 bg-red-500/5",
																				)}
																			>
																				<div className='flex items-start justify-between gap-3 mb-2'>
																					<div className='flex-1 min-w-0'>
																						<p className='font-medium text-foreground text-sm leading-tight'>
																							{cleanCourseName(
																								course.CurriculumName,
																							)}
																						</p>
																						<p className='text-xs text-muted-foreground mt-0.5'>
																							{
																								course.CurriculumID
																							}{" "}
																							•{" "}
																							{
																								course.Credits
																							}{" "}
																							TC
																						</p>
																					</div>
																					<div className='flex flex-col items-end gap-1 flex-shrink-0'>
																						<span
																							className={cn(
																								"px-2 py-0.5 rounded text-xs font-bold",
																								getGradeColor(
																									course.DiemTK_Chu,
																								),
																							)}
																						>
																							{course.DiemTK_Chu ||
																								"—"}
																						</span>
																						{(
																							course.IsPass ===
																							"1"
																						) ?
																							<span className='text-xs text-green-600 dark:text-green-400'>
																								Đạt
																							</span>
																							: <span className='text-xs text-red-600 dark:text-red-400'>
																								Không
																								đạt
																							</span>
																						}
																					</div>
																				</div>
																				<div className='flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/50'>
																					<div className='flex items-center gap-1'>
																						<span className='text-muted-foreground'>
																							Điểm
																							10:
																						</span>
																						<span className='font-semibold text-foreground'>
																							{
																								course.DiemTK_10
																							}
																						</span>
																					</div>
																					<div className='flex items-center gap-1'>
																						<span className='text-muted-foreground'>
																							Điểm
																							4:
																						</span>
																						<span className='font-semibold text-foreground'>
																							{
																								course.DiemTK_4
																							}
																						</span>
																					</div>
																				</div>
																			</div>
																		),
																	)}
																</div>

																{/* Semester Summary */}
																{semester
																	.DanhSachDiemHK?.[0] && (
																		<div className='mt-3 p-3 rounded-lg bg-muted/50'>
																			<div className='grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4 text-sm'>
																				<div>
																					<span className='text-muted-foreground text-xs block sm:inline'>
																						GPA
																						HK{" "}
																					</span>
																					<span className='font-semibold'>
																						{
																							semester
																								.DanhSachDiemHK[0]
																								.TB_HK4
																						}
																						/4.0
																					</span>
																					<span className='text-muted-foreground text-xs ml-1 hidden sm:inline'>
																						(
																						{
																							semester
																								.DanhSachDiemHK[0]
																								.TB_HK
																						}
																						/10)
																					</span>
																				</div>
																				<div>
																					<span className='text-muted-foreground text-xs block sm:inline'>
																						GPA
																						TL{" "}
																					</span>
																					<span className='font-semibold'>
																						{
																							semester
																								.DanhSachDiemHK[0]
																								.TB_TL_HK4
																						}
																						/4.0
																					</span>
																					<span className='text-muted-foreground text-xs ml-1 hidden sm:inline'>
																						(
																						{
																							semester
																								.DanhSachDiemHK[0]
																								.TB_TL_HK
																						}
																						/10)
																					</span>
																				</div>
																				<div className='col-span-2 sm:col-span-1'>
																					<span className='text-muted-foreground text-xs block sm:inline'>
																						TC
																						tích
																						lũy{" "}
																					</span>
																					<span className='font-semibold'>
																						{
																							semester
																								.DanhSachDiemHK[0]
																								.Dat_TL_HK
																						}
																					</span>
																				</div>
																			</div>
																		</div>
																	)}
															</div>
														)}
													</div>
												);
											})}
										</div>
									</CardContent>
								</Card>
							))}
						</div>
			}

			{/* Course Detail Dialog */}
			<Dialog
				open={!!selectedCourse}
				onOpenChange={(open) => !open && setSelectedCourse(null)}
			>
				<DialogContent className='max-w-md'>
					<DialogHeader>
						<DialogTitle className='text-lg font-semibold text-foreground'>
							Chi tiết môn học
						</DialogTitle>
					</DialogHeader>
					{selectedCourse && (
						<div className='space-y-4'>
							{/* Course Name */}
							<div className='p-4 rounded-lg bg-muted/50'>
								<p className='text-xs text-muted-foreground mb-1'>
									Tên môn học
								</p>
								<p className='font-semibold text-foreground'>
									{cleanCourseName(
										selectedCourse.CurriculumName,
									)}
								</p>
								{selectedCourse.EnglishCurriculumName && (
									<p className='text-sm text-muted-foreground italic mt-1'>
										{selectedCourse.EnglishCurriculumName}
									</p>
								)}
							</div>

							{/* Course Info Grid */}
							<div className='grid grid-cols-2 gap-3'>
								<div className='p-3 rounded-lg border bg-card'>
									<p className='text-xs text-muted-foreground'>
										Mã môn
									</p>
									<p className='font-medium text-foreground'>
										{selectedCourse.CurriculumID}
									</p>
								</div>
								<div className='p-3 rounded-lg border bg-card'>
									<p className='text-xs text-muted-foreground'>
										Số tín chỉ
									</p>
									<p className='font-medium text-foreground'>
										{selectedCourse.Credits} TC
									</p>
								</div>
								{selectedCourse.ScheduleStudyUnitID && (
									<div className='p-3 rounded-lg border bg-card col-span-2'>
										<p className='text-xs text-muted-foreground'>
											Mã lớp học phần
										</p>
										<p className='font-medium text-foreground'>
											{selectedCourse.ScheduleStudyUnitID}
										</p>
									</div>
								)}
							</div>

							{/* Scores Section */}
							<div className='space-y-2'>
								<p className='text-sm font-medium text-foreground'>
									Điểm số
								</p>
								<div className='grid grid-cols-3 gap-2'>
									<div className='p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 text-center'>
										<p className='text-xs text-muted-foreground'>
											Điểm 10
										</p>
										<p className='text-xl font-bold text-blue-600 dark:text-blue-400'>
											{selectedCourse.DiemTK_10 || "—"}
										</p>
									</div>
									<div className='p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 text-center'>
										<p className='text-xs text-muted-foreground'>
											Điểm 4
										</p>
										<p className='text-xl font-bold text-purple-600 dark:text-purple-400'>
											{selectedCourse.DiemTK_4 || "—"}
										</p>
									</div>
									<div
										className={cn(
											"p-3 rounded-lg text-center border",
											selectedCourse.IsPass === "1" ?
												"bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20"
												: "bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20",
										)}
									>
										<p className='text-xs text-muted-foreground'>
											Điểm chữ
										</p>
										<p
											className={cn(
												"text-xl font-bold",
												selectedCourse.IsPass === "1" ?
													"text-green-600 dark:text-green-400"
													: "text-red-600 dark:text-red-400",
											)}
										>
											{selectedCourse.DiemTK_Chu || "—"}
										</p>
									</div>
								</div>
							</div>

							{/* Status */}
							<div
								className={cn(
									"flex items-center justify-center gap-2 p-3 rounded-lg",
									selectedCourse.IsPass === "1" ?
										"bg-green-500/10 text-green-600 dark:text-green-400"
										: "bg-red-500/10 text-red-600 dark:text-red-400",
								)}
							>
								{selectedCourse.IsPass === "1" ?
									<>
										<Check className='w-5 h-5' />
										<span className='font-semibold'>
											Đạt
										</span>
									</>
									: <>
										<X className='w-5 h-5' />
										<span className='font-semibold'>
											Chưa đạt
										</span>
									</>
								}
							</div>

							{/* Additional Info */}
							{(selectedCourse.ListOfProfessorName ||
								selectedCourse.Note) && (
									<div className='space-y-2 pt-2 border-t'>
										{selectedCourse.ListOfProfessorName && (
											<div>
												<p className='text-xs text-muted-foreground'>
													Giảng viên
												</p>
												<p className='text-sm text-foreground'>
													{
														selectedCourse.ListOfProfessorName
													}
												</p>
											</div>
										)}
										{selectedCourse.Note && (
											<div>
												<p className='text-xs text-muted-foreground'>
													Ghi chú
												</p>
												<p className='text-sm text-foreground'>
													{selectedCourse.Note}
												</p>
											</div>
										)}
									</div>
								)}

							{selectedCourse.NotComputeAverageScore && (
								<p className='text-xs text-muted-foreground text-center italic'>
									* Môn học này không tính vào điểm trung bình
								</p>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default AcademicResultsPage;
