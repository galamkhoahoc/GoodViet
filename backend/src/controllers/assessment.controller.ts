import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Assessment } from '../models/Assessment';
import { User } from '../models/User';
import { AppError } from '../middleware/error.middleware';
import { normalizeVietnamese } from '../utils/vietnamese.utils';

/**
 * Assessment controller
 */
export class AssessmentController {
  /**
   * POST /api/assessments/start
   * Initialize new assessment
   */
  static async startAssessment(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        throw new AppError(401, 'Unauthorized');
      }

      // Check if user already completed an assessment
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError(404, 'User not found');
      }

      if (user.assessmentCompleted) {
        throw new AppError(409, 'Bạn đã hoàn thành bài kiểm tra đánh giá trước đó.');
      }

      // Check for any ongoing assessments and mark them as abandoned or reuse
      let assessment = await Assessment.findOne({ userId, phase: { $ne: 'completed' } });

      if (!assessment) {
        assessment = await Assessment.create({
          userId: new mongoose.Types.ObjectId(userId),
          phase: 'phase_1',
        });
      } else if (assessment.phase === 'not_started') {
        assessment.phase = 'phase_1';
        await assessment.save();
      }

      // Predefined sentences for phase 1 (mock data for now, should ideally come from a DB or config)
      const sentences = [
        { id: "p1-1", text: "Lúa nếp là lúa nếp làng" },
        { id: "p1-2", text: "Lúa lên lớp lớp lòng nàng lâng lâng" },
        { id: "p1-3", text: "Trời trong xanh, trăng tròn trĩnh" },
        { id: "p1-4", text: "Sáng sớm sương xuống, xóm nhỏ xôn xao" },
        { id: "p1-5", text: "Năm nay lũ lớn ngập lụt xóm làng" },
        { id: "p1-6", text: "Con lươn nó luồn qua lườn em" },
        { id: "p1-7", text: "Chị nhặt rau rồi luộc, em ăn cơm xong rửa bát" },
        { id: "p1-8", text: "Con cá rô rục rịch trong rổ réo róc rách" },
        { id: "p1-9", text: "Trâu trắng ăn cỏ trốn trong chuồng trại" },
        { id: "p1-10", text: "Chú chó chê chim chích chòe chảnh chọe" },
        { id: "p1-11", text: "Mùa xuân sang sáo sậu sổ lồng sải cánh bay xa" },
        { id: "p1-12", text: "Xuân sang xem chim sẻ xào xạc trong lùm xộp" }
      ];

      res.status(201).json({
        assessmentId: assessment._id,
        phase: assessment.phase,
        sentences
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/assessments/:id/recordings
   * Add a recording to the assessment
   */
  static async addRecording(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) throw new AppError(401, 'Unauthorized');

      const { id } = req.params;
      const { recordingId, sentenceId, phase } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(400, 'Invalid Assessment ID');
      }

      const assessment = await Assessment.findOne({ _id: id, userId });
      if (!assessment) {
        throw new AppError(404, 'Assessment not found');
      }

      // Here we would typically link the recording to the assessment in the DB
      // For now, we return success so the frontend knows it's saved.
      res.status(200).json({
        success: true,
        message: 'Recording added successfully',
        recordingId,
        sentenceId
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/assessments/:id/complete-phase
   * Mark phase as complete and trigger analysis if Phase III
   */
  static async completePhase(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) throw new AppError(401, 'Unauthorized');

      const { id } = req.params;
      const { phase } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(400, 'Invalid Assessment ID');
      }

      const assessment = await Assessment.findOne({ _id: id, userId });
      if (!assessment) {
        throw new AppError(404, 'Assessment not found');
      }

      if (phase === 'phase_1') {
        assessment.phase = 'phase_2';
        await assessment.save();
        
        // Mock Phase 2 sentences
        res.status(200).json({
          nextPhase: 'phase_2',
          detectedErrors: ['L/N', 'TR/CH'],
          sentences: [
            { id: "p2-1", text: "Lúa nếp là lúa nếp làng", isRetry: true },
            { id: "p2-2", text: "Trời trong xanh, trăng tròn trĩnh", isRetry: true },
            { id: "p2-3", text: "Bà ba béo bán bánh bèo bên bờ biển", isRetry: false },
          ]
        });
      } else if (phase === 'phase_2') {
        assessment.phase = 'phase_3';
        await assessment.save();
        
        res.status(200).json({
          nextPhase: 'phase_3'
        });
      } else if (phase === 'phase_3') {
        assessment.phase = 'processing';
        await assessment.save();
        
        // Trigger async AI analysis job
        setTimeout(async () => {
          try {
            const { geminiService } = await import('../services/gemini.service');
            // Normally we'd fetch audio from DB/GridFS here.
            // For now, we simulate an audio buffer and run the real Gemini prompt
            const mockAudio = Buffer.from('mock-audio-data');
            const expectedText = "Lúa nếp là lúa nếp làng";
            
            // Normalize Vietnamese text before sending to AI
            // Requirements: 9.4, 9.6, 9.7
            const normalizedExpectedText = normalizeVietnamese(expectedText);
            
            const aiResult = await geminiService.analyzePronunciation(mockAudio, 'audio/mp3', normalizedExpectedText);
            
            const updatedAssessment = await Assessment.findById(id);
            if (updatedAssessment) {
              updatedAssessment.phase = 'completed';
              updatedAssessment.overallScore = aiResult.overallScore || 85;
              updatedAssessment.clarityScore = aiResult.clarityScore || 80;
              updatedAssessment.fluencyScore = aiResult.fluencyScore || 90;
              updatedAssessment.confidenceLevel = aiResult.confidenceLevel || 'high';
              updatedAssessment.completedAt = new Date();
              updatedAssessment.pronunciationIssues = aiResult.issues || [];
              updatedAssessment.recommendedPathwayId = new mongoose.Types.ObjectId();
              await updatedAssessment.save();
              
              await User.findByIdAndUpdate(userId, { assessmentCompleted: true, currentPathwayId: updatedAssessment.recommendedPathwayId });
            }
          } catch (e) {
            console.error('AI Processing error', e);
          }
        }, 0);

        res.status(202).json({
          message: 'Analysis started',
          estimatedTime: 120 // 2 minutes
        });
      } else {
        throw new AppError(400, 'Invalid phase');
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/assessments/:id/status
   * Check processing status
   */
  static async getStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) throw new AppError(401, 'Unauthorized');

      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError(400, 'Invalid Assessment ID');
      }

      const assessment = await Assessment.findOne({ _id: id, userId });
      if (!assessment) {
        throw new AppError(404, 'Assessment not found');
      }

      res.status(200).json({
        assessmentId: assessment._id,
        status: (assessment.phase as string) === 'completed' ? 'completed' : (assessment.phase as string) === 'processing' ? 'processing' : 'failed',
        progress: (assessment.phase as string) === 'completed' ? 100 : 50,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/assessments/result
   * Get user's assessment result
   */
  static async getResult(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) throw new AppError(401, 'Unauthorized');

      const assessment = await Assessment.findOne({ 
        userId, 
        phase: 'completed' 
      }).sort({ completedAt: -1 });

      if (!assessment) {
        throw new AppError(404, 'Chưa có kết quả đánh giá');
      }

      res.status(200).json({
        assessmentId: assessment._id,
        completedAt: assessment.completedAt,
        overallScore: assessment.overallScore,
        clarityScore: assessment.clarityScore,
        fluencyScore: assessment.fluencyScore,
        speechRate: assessment.speechRate,
        confidenceLevel: assessment.confidenceLevel,
        pronunciationIssues: assessment.pronunciationIssues,
        recommendedPathway: {
          id: assessment.recommendedPathwayId,
          name: 'Khắc phục lỗi L/N cơ bản',
          description: 'Lộ trình 7 ngày tập trung vào việc phân biệt và phát âm chuẩn hai phụ âm L và N.',
          durationDays: 7,
          targetPhonemes: ['L/N']
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
