import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, AlertCircle, ChevronRight, CalendarClock } from 'lucide-react';
import { getAllStudyPrograms, type StudyProgram } from '@/services/registrationService';
import { useGlobalNotification } from '@/hooks/useGlobalNotification';

function RegistrationPage() {
    const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showError } = useGlobalNotification();

    useEffect(() => {
        const fetchPrograms = async () => {
            try {
                const data = await getAllStudyPrograms();
                setStudyPrograms(data);
            } catch (err) {
                console.error('Error:', err);
                showError('Không thể tải danh sách chương trình học');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrograms();
    }, [showError]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Đang tải thông tin đăng ký...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    Đăng ký học phần
                </h1>
                <p className="text-sm text-muted-foreground">
                    Chọn chương trình đào tạo để tiến hành đăng ký
                </p>
            </div>

            {studyPrograms.length === 0 ? (
                <Card className="border-0 shadow-lg">
                    <CardContent className="py-12">
                        <div className="text-center">
                            <AlertCircle className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground">
                                Không tìm thấy chương trình đào tạo nào khả dụng
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {studyPrograms.map((program) => (
                        <Card
                            key={program.StudyProgramID}
                            className="border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer group bg-gradient-to-br from-card to-secondary/10"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                        <BookOpen className="w-6 h-6 text-primary" />
                                    </div>
                                    <Badge variant={program.IsOpen ? "default" : "secondary"}>
                                        {program.IsOpen ? "Đang mở" : "Đã đóng"}
                                    </Badge>
                                </div>
                                <CardTitle className="mt-4 text-xl">
                                    {program.StudyProgramName}
                                </CardTitle>
                                <CardDescription>
                                    Mã CT: {program.StudyProgramID}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                                        <CalendarClock className="w-4 h-4" />
                                        <span>Trạng thái: {program.IsOpen ? "Cho phép đăng ký" : "Ngưng đăng ký"}</span>
                                    </div>

                                    <Button
                                        className="w-full group-hover:bg-primary/90"
                                        disabled={!program.IsOpen}
                                    >
                                        {program.IsOpen ? "Vào đăng ký" : "Chi tiết"}
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

export default RegistrationPage;
