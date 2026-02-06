import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
	getStudyPrograms,
	getStudyProgramDetail,
	type StudyProgram,
	type StudyProgramCourse,
} from "@/services/programService";
import {
	Loader2,
	AlertCircle,
	GraduationCap,
	BookOpen,
	Library,
} from "lucide-react";

function EducationalProgramPage() {
	const [_programs, setPrograms] = useState<StudyProgram[]>([]);
	const [selectedProgram, setSelectedProgram] = useState<StudyProgram | null>(
		null,
	);
	const [courses, setCourses] = useState<StudyProgramCourse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingDetail, setIsLoadingDetail] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchPrograms = async () => {
			try {
				const data = await getStudyPrograms();
				setPrograms(data);
				if (data.length > 0) {
					setSelectedProgram(data[0]);
					fetchProgramDetail(data[0].StudyProgramID);
				}
			} catch (err) {
				console.error("Error fetching programs:", err);
				setError(
					"Không thể tải chương trình đào tạo. Vui lòng thử lại sau.",
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchPrograms();
	}, []);

	const fetchProgramDetail = async (programId: string) => {
		setIsLoadingDetail(true);
		try {
			const data = await getStudyProgramDetail(programId);
			setCourses(data.tbStudyPrograms || []);
		} catch (err) {
			console.error("Error fetching program detail:", err);
		} finally {
			setIsLoadingDetail(false);
		}
	};

	const groupBySemester = (courses: StudyProgramCourse[]) => {
		return courses.reduce(
			(acc, course) => {
				const term = course.SemesterName || "Khác";
				if (!acc[term]) {
					acc[term] = [];
				}
				acc[term].push(course);
				return acc;
			},
			{} as Record<string, StudyProgramCourse[]>,
		);
	};

	const semesterGroups = groupBySemester(courses);
	const sortedSemesters = Object.keys(semesterGroups).sort((a, b) => {
		const numA = parseInt(a.match(/\d+/)?.[0] || "0");
		const numB = parseInt(b.match(/\d+/)?.[0] || "0");
		return numA - numB;
	});

	const totalCredits = courses.reduce(
		(sum, course) => sum + (course.STC || 0),
		0,
	);
	const requiredCredits = courses
		.filter((course) => course.BatBuoc === "Bắt Buộc")
		.reduce((sum, course) => sum + (course.STC || 0), 0);
	const electiveCredits = totalCredits - requiredCredits;

	if (isLoading) {
		return (
			<div className='flex items-center justify-center min-h-[60vh]'>
				<div className='text-center space-y-4'>
					<Loader2 className='w-12 h-12 animate-spin text-primary mx-auto' />
					<p className='text-muted-foreground'>
						Đang tải chương trình đào tạo...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex items-center justify-center min-h-[60vh]'>
				<Card className='max-w-md w-full'>
					<CardContent className='pt-6'>
						<div className='text-center space-y-4'>
							<AlertCircle className='w-12 h-12 text-destructive mx-auto' />
							<p className='text-destructive'>{error}</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='space-y-4'>
			{/* Page Header */}
			<div>
				<h1 className='text-2xl md:text-3xl font-bold text-foreground'>
					Chương trình đào tạo
				</h1>
				<p className='text-sm text-muted-foreground'>
					Xem danh sách học phần trong chương trình đào tạo của bạn
				</p>
			</div>

			{/* Program Info Card */}
			{selectedProgram && (
				<Card className='bg-gradient-to-br from-primary to-primary/80 text-primary-foreground'>
					<CardContent className='py-4'>
						<div className='flex flex-col gap-4'>
							<div className='flex items-center gap-3'>
								<div className='w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0'>
									<GraduationCap className='w-5 h-5 md:w-6 md:h-6' />
								</div>
								<div className='min-w-0'>
									<h2 className='text-base md:text-lg font-bold leading-tight'>
										{selectedProgram.StudyProgramName}
									</h2>
									<p className='text-primary-foreground/80 text-xs md:text-sm'>
										Mã: {selectedProgram.StudyProgramID}
									</p>
								</div>
							</div>
							<div className='grid grid-cols-3 gap-2 md:gap-4'>
								<div className='text-center px-2 py-2 md:px-4 bg-white/10 rounded-lg'>
									<div className='text-lg md:text-xl font-bold'>
										{totalCredits}
									</div>
									<div className='text-primary-foreground/80 text-xs'>
										Tổng TC
									</div>
								</div>
								<div className='text-center px-2 py-2 md:px-4 bg-white/10 rounded-lg'>
									<div className='text-lg md:text-xl font-bold'>
										{requiredCredits}
									</div>
									<div className='text-primary-foreground/80 text-xs'>
										Bắt buộc
									</div>
								</div>
								<div className='text-center px-2 py-2 md:px-4 bg-white/10 rounded-lg'>
									<div className='text-lg md:text-xl font-bold'>
										{electiveCredits}
									</div>
									<div className='text-primary-foreground/80 text-xs'>
										Tự chọn
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Courses by Semester */}
			{isLoadingDetail ?
				<div className='flex items-center justify-center py-12'>
					<Loader2 className='w-8 h-8 animate-spin text-primary' />
				</div>
				: <div>
					<h2 className='flex items-center gap-2 text-lg font-semibold mb-4'>
						<BookOpen className='h-5 w-5 text-primary' />
						Danh sách học phần theo học kỳ
					</h2>
					{sortedSemesters.length > 0 ?
						<Tabs
							defaultValue={sortedSemesters[0]}
							className='w-full'
						>
							<div className='overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0'>
								<TabsList className='inline-flex md:flex md:flex-wrap h-auto gap-1 bg-muted/50 p-1 min-w-max md:min-w-0 md:w-full'>
									{sortedSemesters.map((semester) => (
										<TabsTrigger
											key={semester}
											value={semester}
											className='text-xs px-3 py-1.5 whitespace-nowrap'
										>
											{semester}
										</TabsTrigger>
									))}
								</TabsList>
							</div>

							{sortedSemesters.map((semester) => (
								<TabsContent
									key={semester}
									value={semester}
									className='mt-4'
								>
									{/* Desktop Table View */}
									<div className='hidden md:block overflow-x-auto'>
										<table className='w-full text-sm'>
											<thead>
												<tr className='border-b bg-muted/50'>
													<th className='text-left p-3 font-medium'>
														Mã HP
													</th>
													<th className='text-left p-3 font-medium'>
														Tên học phần
													</th>
													<th className='text-center p-3 font-medium'>
														STC
													</th>
													<th className='text-center p-3 font-medium'>
														Loại
													</th>
													<th className='text-left p-3 font-medium'>
														Học trước
													</th>
													<th className='text-left p-3 font-medium hidden lg:table-cell'>
														Khoa/Bộ môn
													</th>
												</tr>
											</thead>
											<tbody>
												{semesterGroups[
													semester
												].map((course, index) => (
													<tr
														key={
															course.CurriculumID +
															index
														}
														className='border-b hover:bg-muted/30 transition-colors'
													>
														<td className='p-3 font-mono text-xs'>
															{
																course.CurriculumID
															}
														</td>
														<td className='p-3'>
															{course.TenHP}
														</td>
														<td className='p-3 text-center font-semibold'>
															{course.STC}
														</td>
														<td className='p-3 text-center'>
															<Badge
																variant={
																	(
																		course.BatBuoc ===
																		"Bắt Buộc"
																	) ?
																		"default"
																		: "secondary"
																}
																className='text-xs'
															>
																{(
																	course.BatBuoc ===
																	"Bắt Buộc"
																) ?
																	"BB"
																	: "TC"}
															</Badge>
														</td>
														<td className='p-3 text-muted-foreground'>
															{course.HPHocTruoc ||
																"—"}
														</td>
														<td className='p-3 text-muted-foreground hidden lg:table-cell text-xs'>
															{course.Khoa ||
																"—"}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>

									{/* Mobile Card View */}
									<div className='md:hidden space-y-3'>
										{semesterGroups[semester].map(
											(course, index) => (
												<div
													key={
														course.CurriculumID +
														index
													}
													className='border rounded-lg p-3 bg-card hover:bg-muted/30 transition-colors'
												>
													<div className='flex items-start justify-between gap-2 mb-2'>
														<div className='flex-1 min-w-0'>
															<h4 className='font-medium text-sm leading-tight'>
																{
																	course.TenHP
																}
															</h4>
															<p className='text-xs text-muted-foreground font-mono mt-0.5'>
																{
																	course.CurriculumID
																}
															</p>
														</div>
														<div className='flex items-center gap-2 flex-shrink-0'>
															<Badge
																variant={
																	(
																		course.BatBuoc ===
																		"Bắt Buộc"
																	) ?
																		"default"
																		: "secondary"
																}
																className='text-xs'
															>
																{(
																	course.BatBuoc ===
																	"Bắt Buộc"
																) ?
																	"BB"
																	: "TC"}
															</Badge>
															<span className='text-sm font-bold text-primary'>
																{course.STC}{" "}
																TC
															</span>
														</div>
													</div>
													{course.HPHocTruoc && (
														<div className='text-xs text-muted-foreground border-t pt-2 mt-2'>
															<span className='font-medium'>
																Học trước:
															</span>{" "}
															{
																course.HPHocTruoc
															}
														</div>
													)}
												</div>
											),
										)}
									</div>

									{/* Semester Summary */}
									<div className='mt-4 flex gap-4 text-sm text-muted-foreground'>
										<span>
											Số học phần:{" "}
											<strong className='text-foreground'>
												{
													semesterGroups[semester]
														.length
												}
											</strong>
										</span>
										<span>
											Tổng tín chỉ:{" "}
											<strong className='text-foreground'>
												{semesterGroups[
													semester
												].reduce(
													(sum, c) =>
														sum + (c.STC || 0),
													0,
												)}
											</strong>
										</span>
									</div>
								</TabsContent>
							))}
						</Tabs>
						: <div className='text-center py-8 text-muted-foreground'>
							<Library className='w-12 h-12 mx-auto mb-4 opacity-50' />
							<p>Không có dữ liệu học phần</p>
						</div>
					}
				</div>
			}
		</div>
	);
}

export default EducationalProgramPage;
