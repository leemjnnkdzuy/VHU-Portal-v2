import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    getStudentDecisions,
    type DecisionItem,
} from '@/services/decisionService';
import {
    Loader2,
    AlertCircle,
    FileText,
    Calendar,
    User,
    Hash,
    ScrollText,
} from 'lucide-react';

function DecisionsPage() {
    const [decisions, setDecisions] = useState<DecisionItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDecisions = async () => {
            try {
                const data = await getStudentDecisions();
                setDecisions(data || []);
            } catch (err) {
                console.error('Error:', err);
                setError('Không thể tải quyết định sinh viên');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDecisions();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Đang tải quyết định...</p>
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

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    Quyết định sinh viên
                </h1>
                <p className="text-sm text-muted-foreground">
                    Danh sách các quyết định liên quan đến sinh viên
                </p>
            </div>

            {/* Decisions List */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <ScrollText className="h-5 w-5 text-primary" />
                        Danh sách quyết định ({decisions.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {decisions.length > 0 ? (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="text-left p-3 font-medium">Năm học</th>
                                            <th className="text-center p-3 font-medium">HK</th>
                                            <th className="text-left p-3 font-medium">Số QĐ</th>
                                            <th className="text-left p-3 font-medium">Loại QĐ</th>
                                            <th className="text-left p-3 font-medium">Nội dung</th>
                                            <th className="text-left p-3 font-medium">Người ký</th>
                                            <th className="text-left p-3 font-medium">Ngày ký</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {decisions.map((decision, index) => (
                                            <tr key={index} className="border-b hover:bg-muted/30 transition-colors">
                                                <td className="p-3">{decision.YearStudy}</td>
                                                <td className="p-3 text-center">
                                                    <Badge variant="outline">{decision.TermID}</Badge>
                                                </td>
                                                <td className="p-3 font-mono text-xs">{decision.DecisionNumber}</td>
                                                <td className="p-3">
                                                    <Badge variant="secondary">{decision.DecisionName}</Badge>
                                                </td>
                                                <td className="p-3 max-w-md">
                                                    <p className="line-clamp-2">{decision.FullText}</p>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-1">
                                                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                                                        <span>{decision.SignStaff || '—'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                                        <span>{decision.SignDate || '—'}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-3">
                                {decisions.map((decision, index) => (
                                    <div
                                        key={index}
                                        className="border rounded-lg p-4 space-y-3 bg-card hover:bg-muted/30 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">{decision.YearStudy}</Badge>
                                                <Badge variant="outline">HK{decision.TermID}</Badge>
                                            </div>
                                            <Badge variant="secondary">{decision.DecisionName}</Badge>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Hash className="w-4 h-4 text-muted-foreground" />
                                                <span className="font-mono">{decision.DecisionNumber}</span>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                                                <p className="text-muted-foreground line-clamp-3">{decision.FullText}</p>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t">
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <User className="w-3.5 h-3.5" />
                                                    <span className="text-xs">{decision.SignStaff || '—'}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span className="text-xs">{decision.SignDate || '—'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <ScrollText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Không có quyết định nào</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default DecisionsPage;
