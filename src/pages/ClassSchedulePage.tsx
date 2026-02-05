import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
    getYearAndTerm,
    getWeekSchedule,
    getDrawingSchedules,
    type YearAndTermData,
    type Week,
    type ScheduleData,
    type ScheduleItem,
} from '@/services/scheduleService';
import {
    Loader2,
    AlertCircle,
    Calendar,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    Clock,
    MapPin,
    User,
    Star,
} from 'lucide-react';

const TIME_BLOCKS = {
    MORNING: { start: 1, end: 5, label: 'Sáng', time: '7:00 - 11:00', color: 'bg-amber-500/10 border-amber-500/30' },
    AFTERNOON: { start: 6, end: 10, label: 'Chiều', time: '12:30 - 16:00', color: 'bg-blue-500/10 border-blue-500/30' },
    EVENING: { start: 11, end: 15, label: 'Tối', time: '17:00 - 20:00', color: 'bg-purple-500/10 border-purple-500/30' },
};

const DAYS_OF_WEEK = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

function ClassSchedulePage() {
    const [yearTermData, setYearTermData] = useState<YearAndTermData | null>(null);
    const [weeks, setWeeks] = useState<Week[]>([]);
    const [schedule, setSchedule] = useState<ScheduleData | null>(null);
    const [selectedYear, setSelectedYear] = useState<string>('');
    const [selectedTerm, setSelectedTerm] = useState<string>('');
    const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
    const [currentWeekNum, setCurrentWeekNum] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const parseDate = (dateStr: string): Date => {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
    };

    const findCurrentWeek = useCallback((weeksList: Week[]): Week | null => {
        const today = new Date();
        const currentWeek = weeksList.find((week) => {
            const beginDate = parseDate(week.BeginDate);
            const endDate = parseDate(week.EndDate);
            return today >= beginDate && today <= endDate;
        });

        if (currentWeek) {
            setCurrentWeekNum(currentWeek.Week);
            return currentWeek;
        }

        const futureWeeks = weeksList.filter((week) => parseDate(week.BeginDate) > today);
        if (futureWeeks.length > 0) {
            setCurrentWeekNum(futureWeeks[0].Week);
            return futureWeeks[0];
        }

        if (weeksList.length > 0) {
            setCurrentWeekNum(weeksList[0].Week);
            return weeksList[0];
        }

        return null;
    }, []);

    useEffect(() => {
        const fetchYearAndTerm = async () => {
            try {
                const data = await getYearAndTerm();
                setYearTermData(data);
                setSelectedYear(data.CurrentYear);
                setSelectedTerm(data.CurrentTerm);
            } catch (err) {
                console.error('Error:', err);
                setError('Không thể tải dữ liệu năm học và học kỳ');
            } finally {
                setIsLoading(false);
            }
        };
        fetchYearAndTerm();
    }, []);

    useEffect(() => {
        if (!selectedYear || !selectedTerm) return;

        const fetchWeeks = async () => {
            try {
                const data = await getWeekSchedule(selectedYear, selectedTerm);
                setWeeks(data);
                const currentWeek = findCurrentWeek(data);
                if (currentWeek) {
                    setSelectedWeek(currentWeek.Week);
                }
            } catch (err) {
                console.error('Error:', err);
            }
        };
        fetchWeeks();
    }, [selectedYear, selectedTerm, findCurrentWeek]);

    useEffect(() => {
        if (!selectedYear || !selectedTerm || !selectedWeek) return;

        const fetchSchedule = async () => {
            setIsLoadingSchedule(true);
            try {
                const data = await getDrawingSchedules(selectedYear, selectedTerm, selectedWeek);
                setSchedule(data);
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setIsLoadingSchedule(false);
            }
        };
        fetchSchedule();
    }, [selectedYear, selectedTerm, selectedWeek]);

    const handlePrevWeek = () => {
        const currentIndex = weeks.findIndex((week) => week.Week === selectedWeek);
        if (currentIndex > 0) {
            setSelectedWeek(weeks[currentIndex - 1].Week);
        }
    };

    const handleNextWeek = () => {
        const currentIndex = weeks.findIndex((week) => week.Week === selectedWeek);
        if (currentIndex < weeks.length - 1) {
            setSelectedWeek(weeks[currentIndex + 1].Week);
        }
    };

    const goToCurrentWeek = () => {
        if (currentWeekNum) {
            setSelectedWeek(currentWeekNum);
        }
    };

    const getScheduleItemsForDayAndBlock = (dayIndex: number, blockType: keyof typeof TIME_BLOCKS): ScheduleItem[] => {
        if (!schedule?.ResultDataSchedule) return [];
        const { start, end } = TIME_BLOCKS[blockType];
        return schedule.ResultDataSchedule.filter((item) => {
            const lessonNumber = parseInt(item.BeginTime.replace('Tiết: ', ''));
            return item.DayOfWeek === dayIndex + 1 && lessonNumber >= start && lessonNumber <= end;
        });
    };

    const renderScheduleItem = (item: ScheduleItem) => {
        const beginLesson = item.BeginTime.replace('Tiết: ', '');
        const endLesson = item.EndTime.replace('Tiết: ', '');

        return (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 text-xs space-y-1">
                <div className="font-semibold text-foreground line-clamp-2">{item.CurriculumName}</div>
                <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Tiết {beginLesson} - {endLesson}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{item.RoomID?.replace('</br>', ' - ') || '—'}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span className="line-clamp-1">{item.ProfessorName || '—'}</span>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Đang tải thời khóa biểu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
                            <p className="text-destructive">{error}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const currentWeekData = weeks.find(w => w.Week === selectedWeek);

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    Thời khóa biểu
                </h1>
                <p className="text-sm text-muted-foreground">
                    Xem lịch học theo tuần
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        {/* Year and Term Selectors */}
                        <div className="flex gap-3">
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Chọn năm học" />
                                </SelectTrigger>
                                <SelectContent>
                                    {yearTermData?.YearStudy.map((year) => (
                                        <SelectItem key={year} value={year}>
                                            Năm học {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Chọn học kỳ" />
                                </SelectTrigger>
                                <SelectContent>
                                    {yearTermData?.Terms.map((term) => (
                                        <SelectItem key={term.TermID} value={term.TermID}>
                                            {term.TermName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Week Navigation */}
                        <div className="flex items-center gap-2 flex-1 justify-end">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={goToCurrentWeek}
                                disabled={selectedWeek === currentWeekNum}
                                title="Về tuần hiện tại"
                            >
                                <CalendarDays className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handlePrevWeek}
                                disabled={weeks.findIndex((w) => w.Week === selectedWeek) === 0}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>

                            <Select
                                value={selectedWeek?.toString() || ''}
                                onValueChange={(val) => setSelectedWeek(parseInt(val))}
                            >
                                <SelectTrigger className="w-[280px]">
                                    <SelectValue placeholder="Chọn tuần" />
                                </SelectTrigger>
                                <SelectContent>
                                    {weeks.map((week) => (
                                        <SelectItem key={week.Week} value={week.Week.toString()}>
                                            <span className="flex items-center gap-1">
                                                Tuần {week.Week} ({week.BeginDate} - {week.EndDate})
                                                {week.Week === currentWeekNum && (
                                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                )}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleNextWeek}
                                disabled={weeks.findIndex((w) => w.Week === selectedWeek) === weeks.length - 1}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Schedule Table */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Calendar className="h-5 w-5 text-primary" />
                        {currentWeekData && (
                            <span>
                                Tuần {selectedWeek} ({currentWeekData.BeginDate} - {currentWeekData.EndDate})
                            </span>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingSchedule ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-muted/50">
                                        <th className="p-2 text-left font-medium border w-24">Buổi</th>
                                        {DAYS_OF_WEEK.map((day, index) => (
                                            <th key={index} className="p-2 text-center font-medium border min-w-[120px]">
                                                {day}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(TIME_BLOCKS).map(([block, { label, time, color }]) => (
                                        <tr key={block}>
                                            <td className={cn('p-2 border font-medium', color)}>
                                                <div>{label}</div>
                                                <div className="text-xs text-muted-foreground">({time})</div>
                                            </td>
                                            {DAYS_OF_WEEK.map((_, dayIndex) => {
                                                const items = getScheduleItemsForDayAndBlock(dayIndex, block as keyof typeof TIME_BLOCKS);
                                                return (
                                                    <td key={dayIndex} className="p-1 border align-top">
                                                        <div className="space-y-1">
                                                            {items.map((item, idx) => (
                                                                <div key={idx}>{renderScheduleItem(item)}</div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default ClassSchedulePage;
