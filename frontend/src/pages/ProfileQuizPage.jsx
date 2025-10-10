import { useState } from 'react';
import { profileAPI } from '../lib/api';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const quizQuestions = [
  {
    id: 1,
    question: "What's your favorite subject?",
    options: ["Computer Science", "Mathematics", "Physics", "Biology", "Business", "Other"],
  },
  {
    id: 2,
    question: "What topics interest you most?",
    options: ["Algorithms", "Web Development", "Machine Learning", "Data Science", "Cybersecurity", "Mobile Apps"],
  },
  {
    id: 3,
    question: "When do you prefer to study?",
    options: ["Morning", "Afternoon", "Evening", "Night", "Flexible"],
  },
  {
    id: 4,
    question: "How do you learn best?",
    options: ["Solo study", "Small groups", "Large groups", "One-on-one tutoring", "Mix of methods"],
  },
  {
    id: 5,
    question: "What's your study style?",
    options: ["Active practice", "Reading notes", "Video tutorials", "Discussion-based", "Project-based"],
  },
];

export default function ProfileQuizPage({ user, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnswer = (answer) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers) => {
    setLoading(true);
    setError('');

    try {
      await profileAPI.submitQuiz(finalAnswers);
      onComplete();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit quiz');
      setLoading(false);
    }
  };

  const question = quizQuestions[currentQuestion];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome, {user.email}!</CardTitle>
          <CardDescription>
            Let's personalize your experience. Answer a few questions to help us understand your interests.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
              <span>{Math.round((currentQuestion / quizQuestions.length) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(currentQuestion / quizQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-semibold">{question.question}</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {question.options.map((option) => (
                <Button
                  key={option}
                  variant="outline"
                  className="h-auto py-4 text-left justify-start"
                  onClick={() => handleAnswer(option)}
                  disabled={loading}
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="text-center text-muted-foreground">
              Processing your answers with AI...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

