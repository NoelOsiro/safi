"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Clock, Award, BookOpen } from "lucide-react"

const mockQuestions = [
  {
    id: 1,
    question: "What is the safe minimum internal temperature for cooking chicken?",
    options: ["145°F (63°C)", "160°F (71°C)", "165°F (74°C)", "180°F (82°C)"],
    correct: 2,
    explanation:
      "Chicken should be cooked to an internal temperature of 165°F (74°C) to ensure harmful bacteria are eliminated.",
  },
  {
    id: 2,
    question: "How long can perishable foods be left in the 'danger zone' temperature range?",
    options: ["30 minutes", "1 hour", "2 hours", "4 hours"],
    correct: 2,
    explanation:
      "Perishable foods should not be left in the danger zone (40-140°F) for more than 2 hours to prevent bacterial growth.",
  },
  {
    id: 3,
    question: "What is the first step in proper handwashing?",
    options: ["Apply soap", "Wet hands with warm water", "Scrub for 20 seconds", "Dry with clean towel"],
    correct: 1,
    explanation:
      "The first step in proper handwashing is to wet your hands with clean, running warm water before applying soap.",
  },
]

export default function AssessmentContent() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [assessmentStarted, setAssessmentStarted] = useState(false)

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleNextQuestion = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers]
      newAnswers[currentQuestion] = selectedAnswer
      setAnswers(newAnswers)

      if (currentQuestion < mockQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
      } else {
        setShowResults(true)
      }
    }
  }

  const handleStartAssessment = () => {
    setAssessmentStarted(true)
    setCurrentQuestion(0)
    setAnswers([])
    setSelectedAnswer(null)
    setShowResults(false)
  }

  const calculateScore = () => {
    let correct = 0
    answers.forEach((answer, index) => {
      if (answer === mockQuestions[index].correct) {
        correct++
      }
    })
    return Math.round((correct / mockQuestions.length) * 100)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { text: "Excellent", color: "bg-green-100 text-green-800" }
    if (score >= 60) return { text: "Good", color: "bg-yellow-100 text-yellow-800" }
    return { text: "Needs Improvement", color: "bg-red-100 text-red-800" }
  }

  if (!assessmentStarted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Food Safety Assessment</h1>
              <p className="text-gray-600">Test your knowledge and earn your certification</p>
            </div>

            {/* Assessment Overview */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-600" />
                  Assessment Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{mockQuestions.length}</div>
                    <div className="text-sm text-gray-600">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">15</div>
                    <div className="text-sm text-gray-600">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">80%</div>
                    <div className="text-sm text-gray-600">Passing Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    Read each question carefully before selecting your answer
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    You must score 80% or higher to pass the assessment
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    You can retake the assessment if needed
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    Take your time - there's no time limit
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Start Button */}
            <div className="text-center">
              <Button onClick={handleStartAssessment} size="lg" className="px-8">
                <Clock className="h-5 w-5 mr-2" />
                Start Assessment
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showResults) {
    const score = calculateScore()
    const scoreBadge = getScoreBadge(score)

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Results Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment Results</h1>
              <p className="text-gray-600">Here's how you performed</p>
            </div>

            {/* Score Card */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-center">
                  <div className={`text-6xl font-bold ${getScoreColor(score)} mb-2`}>{score}%</div>
                  <Badge className={scoreBadge.color}>{scoreBadge.text}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <Progress value={score} className="w-full max-w-md mx-auto" />
                  <p className="text-gray-600">
                    You answered {answers.filter((answer, index) => answer === mockQuestions[index].correct).length} out
                    of {mockQuestions.length} questions correctly
                  </p>
                  {score >= 80 ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-semibold">Congratulations! You passed the assessment.</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-red-600">
                      <XCircle className="h-5 w-5" />
                      <span className="font-semibold">You need 80% or higher to pass. Please try again.</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Question Review */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Question Review</CardTitle>
                <CardDescription>Review your answers and learn from explanations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockQuestions.map((question, index) => {
                    const userAnswer = answers[index]
                    const isCorrect = userAnswer === question.correct

                    return (
                      <div key={question.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-start gap-3 mb-3">
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-1" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
                          )}
                          <div className="flex-1">
                            <h4 className="font-semibold mb-2">
                              Question {index + 1}: {question.question}
                            </h4>
                            <div className="space-y-1 text-sm">
                              <p>
                                <span className="font-medium">Your answer:</span>{" "}
                                <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                                  {question.options[userAnswer]}
                                </span>
                              </p>
                              {!isCorrect && (
                                <p>
                                  <span className="font-medium">Correct answer:</span>{" "}
                                  <span className="text-green-600">{question.options[question.correct]}</span>
                                </p>
                              )}
                              <p className="text-gray-600 mt-2">
                                <span className="font-medium">Explanation:</span> {question.explanation}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="text-center space-x-4">
              <Button onClick={() => setAssessmentStarted(false)} variant="outline">
                Take Again
              </Button>
              {score >= 80 && (
                <Button>
                  <Award className="h-4 w-4 mr-2" />
                  View Certificate
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const progress = ((currentQuestion + 1) / mockQuestions.length) * 100
  const question = mockQuestions[currentQuestion]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Food Safety Assessment</h1>
              <Badge variant="outline">
                Question {currentQuestion + 1} of {mockQuestions.length}
              </Badge>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Question Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{question.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedAnswer?.toString()}
                onValueChange={(value) => handleAnswerSelect(Number.parseInt(value))}
              >
                <div className="space-y-4">
                  {question.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label
                        htmlFor={`option-${index}`}
                        className="flex-1 cursor-pointer p-3 rounded-lg hover:bg-gray-50"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <div className="flex justify-between items-center mt-8">
                <div className="text-sm text-gray-600">Select an answer to continue</div>
                <Button onClick={handleNextQuestion} disabled={selectedAnswer === null}>
                  {currentQuestion === mockQuestions.length - 1 ? "Finish Assessment" : "Next Question"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
