import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/star-rating";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { feedbackFormSchema } from "@shared/schema";

type FeedbackFormData = z.infer<typeof feedbackFormSchema>;

export function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const { toast } = useToast();

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      content: "",
      rating: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FeedbackFormData) => {
      const response = await apiRequest("POST", "/api/feedbacks", {
        content: data.content,
        rating: data.rating || null,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Opinia została dodana",
        description: "Dziękujemy za podzielenie się swoją opinią!",
      });
      form.reset();
      setRating(0);
      queryClient.invalidateQueries({ queryKey: ["/api/feedbacks"] });
    },
    onError: () => {
      toast({
        title: "Błąd",
        description: "Nie udało się dodać opinii. Spróbuj ponownie.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FeedbackFormData) => {
    mutation.mutate({
      ...data,
      rating: rating > 0 ? rating : undefined,
    });
  };

  const contentLength = form.watch("content")?.length || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Dodaj swoją opinię
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="content">Twoja opinia</Label>
            <Textarea
              id="content"
              placeholder="Podziel się swoją opinią..."
              className="min-h-[150px] resize-none"
              {...form.register("content")}
              data-testid="input-feedback-content"
            />
            <div className="flex justify-between items-center">
              {form.formState.errors.content && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.content.message}
                </p>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {contentLength}/500
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ocena (opcjonalna)</Label>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              size="md"
            />
          </div>

          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={mutation.isPending}
            data-testid="button-submit-feedback"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Wysyłanie...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Wyślij opinię
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
