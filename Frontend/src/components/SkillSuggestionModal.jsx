import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

export default React.memo(function SkillSuggestion({ 
    suggestions, 
    onApprove, 
    onReject,
    isApprovePending,
    isRejectPending 
}) {
    if (!suggestions?.length) {
        return null;
    }

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Skill Suggestions ({suggestions.length})
                </CardTitle>
                <CardDescription>
                    User-submitted skill suggestions awaiting review
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {suggestions.map((suggestion) => (
                        <div key={suggestion._id} className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-white">{suggestion.name}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    Category: {suggestion.category} | Suggested by: {suggestion.suggestedBy?.name}
                                </div>
                                {suggestion.description && (
                                    <div className="text-sm mt-1 text-gray-600 dark:text-gray-300">{suggestion.description}</div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onApprove(suggestion)}
                                    disabled={isApprovePending}
                                >
                                    {isApprovePending ? 'Approving...' : 'Approve'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onReject(suggestion)}
                                    disabled={isRejectPending}
                                >
                                    {isRejectPending ? 'Rejecting...' : 'Reject'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
});