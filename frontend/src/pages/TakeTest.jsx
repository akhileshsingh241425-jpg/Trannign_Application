import React, { useState, useEffect } from 'react';
import { Card, Button, Radio, Space, message, Result, Spin, Tag } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { testAPI } from '../services/api';
import { testQuestionsByDepartment } from '../data/testQuestions';
import './TakeTest.css';

const TakeTest = ({ user }) => {
  const [assignedTests, setAssignedTests] = useState([]);
  const [currentTest, setCurrentTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchPendingTests();
  }, []);

  const fetchPendingTests = async () => {
    try {
      setLoading(true);
      const response = await testAPI.getAll({ punchId: user.punchId, category: 'Pending' });
      setAssignedTests(response.data.data || []);
    } catch (error) {
      message.error('Failed to fetch tests');
    } finally {
      setLoading(false);
    }
  };

  const startTest = (test) => {
    setCurrentTest(test);
    // Get questions for employee's department
    const deptQuestions = testQuestionsByDepartment[test.Employee?.department] || testQuestionsByDepartment['Production'];
    setQuestions(deptQuestions);
    setAnswers({});
    setSubmitted(false);
  };

  const handleAnswer = (questionId, answerIndex) => {
    setAnswers({
      ...answers,
      [questionId]: answerIndex
    });
  };

  const submitTest = async () => {
    // Calculate score
    let correctCount = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / questions.length) * 100);
    setScore(percentage);

    // Determine category
    let category = 'Fail';
    if (percentage >= 70) category = 'Pass';
    else if (percentage >= 50) category = 'Retraining';

    try {
      setLoading(true);
      await testAPI.update(currentTest.id, {
        scorePercentage: percentage,
        obtainedMarks: correctCount,
        maxMarks: questions.length,
        category: category
      });
      
      setSubmitted(true);
      message.success('Test submitted successfully!');
      
      // Refresh test list after 2 seconds
      setTimeout(() => {
        fetchPendingTests();
        setCurrentTest(null);
      }, 3000);
    } catch (error) {
      message.error('Failed to submit test');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !currentTest) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" />
      </div>
    );
  }

  // If test is submitted, show result
  if (submitted) {
    return (
      <div style={{ padding: 24 }}>
        <Result
          status={score >= 70 ? "success" : score >= 50 ? "warning" : "error"}
          title={score >= 70 ? "Congratulations! You Passed!" : score >= 50 ? "Retraining Required" : "Failed"}
          subTitle={`You scored ${score}% (${answers ? Object.keys(answers).filter(k => answers[k] === questions.find(q => q.id === parseInt(k))?.correctAnswer).length : 0} out of ${questions.length} correct)`}
          extra={[
            <Button type="primary" key="back" onClick={() => setCurrentTest(null)}>
              Back to Tests
            </Button>
          ]}
        />
      </div>
    );
  }

  // If taking test, show questions
  if (currentTest && questions.length > 0) {
    return (
      <div style={{ padding: 24 }}>
        <Card
          title={
            <Space>
              <ClockCircleOutlined />
              <span>{currentTest.testTopic}</span>
              <Tag color="blue">{questions.length} Questions</Tag>
            </Space>
          }
          extra={
            <Button 
              type="primary" 
              onClick={submitTest}
              disabled={Object.keys(answers).length < questions.length}
            >
              Submit Test ({Object.keys(answers).length}/{questions.length})
            </Button>
          }
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {questions.map((q, index) => (
              <Card 
                key={q.id} 
                type="inner" 
                title={`Question ${index + 1} of ${questions.length}`}
                style={{ marginBottom: 16 }}
              >
                <div style={{ marginBottom: 16, fontSize: 16, fontWeight: 500 }}>
                  {q.question}
                </div>
                <Radio.Group 
                  onChange={(e) => handleAnswer(q.id, e.target.value)}
                  value={answers[q.id]}
                  style={{ width: '100%' }}
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    {q.options.map((option, idx) => (
                      <Radio key={idx} value={idx} style={{ fontSize: 15, padding: '8px 0' }}>
                        {option}
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              </Card>
            ))}
          </Space>
        </Card>
      </div>
    );
  }

  // Show list of pending tests
  return (
    <div style={{ padding: 24 }}>
      <Card title={<><CheckCircleOutlined /> My Assigned Tests</>}>
        {assignedTests.length === 0 ? (
          <Result
            title="No Pending Tests"
            subTitle="You don't have any pending tests assigned."
          />
        ) : (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {assignedTests.map((test) => (
              <Card 
                key={test.id}
                hoverable
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>{test.testTopic}</h3>
                    <p style={{ margin: '8px 0 0 0', color: '#888' }}>
                      Assigned by: {test.evaluatedBy} | Date: {new Date(test.testDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Button type="primary" onClick={() => startTest(test)}>
                    Start Test
                  </Button>
                </div>
              </Card>
            ))}
          </Space>
        )}
      </Card>
    </div>
  );
};

export default TakeTest;
