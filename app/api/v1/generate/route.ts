/**
 * API Code Generation Endpoint
 * POST /api/v1/generate - Generate code using AI (with API key authentication)
 * 
 * Headers:
 * - Authorization: Bearer afn_live_xxxxx or Bearer afn_test_xxxxx
 * 
 * Body:
 * {
 *   "prompt": "Create a todo list app",
 *   "techStack": {
 *     "frontend": "React",
 *     "backend": "Node.js",
 *     "database": "PostgreSQL",
 *     "styling": "Tailwind CSS"
 *   },
 *   "projectType": "component" | "page" | "feature" | "project"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth, checkCredits, addApiHeaders } from '@/lib/middleware/api-auth';
import { calculateCredits, trackAndDeduct } from '@/lib/services/api-usage-tracker';
import { createErrorResponse } from '@/lib/middleware/api-auth';
import { generateCodeWithAgents } from '@/lib/services/code-generator';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Authenticate the request
    const auth = await withApiAuth(request);
    
    if (!auth.success) {
      return auth.response;
    }

    const { apiKey, userId } = auth;

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return createErrorResponse('Invalid JSON', 'Request body must be valid JSON', 400);
    }

    // Validate required fields
    if (!body.prompt || typeof body.prompt !== 'string') {
      return createErrorResponse(
        'Validation Error',
        'Prompt is required and must be a string',
        400
      );
    }

    if (!body.techStack || typeof body.techStack !== 'object') {
      return createErrorResponse(
        'Validation Error',
        'Tech stack is required and must be an object',
        400
      );
    }

    // Validate project type
    const projectType = body.projectType || 'component';
    if (!['component', 'page', 'feature', 'project'].includes(projectType)) {
      return createErrorResponse(
        'Validation Error',
        'Project type must be one of: component, page, feature, project',
        400
      );
    }

    // Calculate credits required
    const creditsRequired = calculateCredits({
      projectType,
      promptLength: body.prompt.length,
      estimatedLines: body.estimatedLines,
    });

    // Check if user has sufficient credits
    const creditCheck = checkCredits(apiKey, creditsRequired);
    if (!creditCheck.hasCredits) {
      return creditCheck.response!;
    }

    // Get IP and User-Agent for logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Generate code using AI agents
    let generationResult;
    try {
      generationResult = await generateCodeWithAgents({
        prompt: body.prompt,
        techStack: body.techStack,
        projectType,
        userId,
      });
    } catch (error: any) {
      const generationTime = Date.now() - startTime;

      // Log failed generation (don't deduct credits)
      await trackAndDeduct({
        apiKeyId: apiKey.id,
        userId,
        endpoint: '/api/v1/generate',
        method: 'POST',
        statusCode: 500,
        creditsToDeduct: 0, // Don't charge for failures
        generationTimeMs: generationTime,
        promptLength: body.prompt.length,
        projectType,
        errorMessage: error.message || 'Code generation failed',
        ipAddress,
        userAgent,
      });

      return createErrorResponse(
        'Generation Failed',
        error.message || 'Failed to generate code',
        500
      );
    }

    const generationTime = Date.now() - startTime;

    // Count lines of code generated
    const linesOfCode = generationResult.files
      ? generationResult.files.reduce((total, file) => {
          return total + file.content.split('\n').length;
        }, 0)
      : 0;

    // Track usage and deduct credits
    const trackResult = await trackAndDeduct({
      apiKeyId: apiKey.id,
      userId,
      endpoint: '/api/v1/generate',
      method: 'POST',
      statusCode: 200,
      creditsToDeduct: creditsRequired,
      tokensUsed: generationResult.tokensUsed || 0,
      generationTimeMs: generationTime,
      promptLength: body.prompt.length,
      linesOfCodeGenerated: linesOfCode,
      projectType,
      ipAddress,
      userAgent,
    });

    if (!trackResult.success) {
      console.error('Failed to track usage:', trackResult.error);
      // Continue anyway - the code was generated successfully
    }

    // Prepare response
    const response = NextResponse.json({
      success: true,
      data: {
        files: generationResult.files || [],
        instructions: generationResult.instructions || '',
        metadata: {
          project_type: projectType,
          lines_of_code: linesOfCode,
          tokens_used: generationResult.tokensUsed || 0,
          generation_time_ms: generationTime,
          credits_consumed: creditsRequired,
          credits_remaining: trackResult.newBalance || 0,
        },
      },
      timestamp: new Date().toISOString(),
    });

    // Add API headers
    return addApiHeaders(response, apiKey);
  } catch (error: any) {
    console.error('Error in POST /api/v1/generate:', error);

    const generationTime = Date.now() - startTime;

    // Try to log the error if we have auth
    try {
      const auth = await withApiAuth(request);
      if (auth.success) {
        await trackAndDeduct({
          apiKeyId: auth.apiKey.id,
          userId: auth.userId,
          endpoint: '/api/v1/generate',
          method: 'POST',
          statusCode: 500,
          creditsToDeduct: 0,
          generationTimeMs: generationTime,
          errorMessage: error.message || 'Internal server error',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        });
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return createErrorResponse('Server Error', 'An unexpected error occurred', 500);
  }
}

/**
 * GET /api/v1/generate
 * Get API documentation and example
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/v1/generate',
    method: 'POST',
    description: 'Generate code using AfriNova AI agents',
    authentication: 'Bearer token required (API key)',
    headers: {
      'Authorization': 'Bearer afn_live_xxxxx or Bearer afn_test_xxxxx',
      'Content-Type': 'application/json',
    },
    body_schema: {
      prompt: {
        type: 'string',
        required: true,
        description: 'Description of what you want to build',
        example: 'Create a todo list app with add, edit, and delete functionality',
      },
      techStack: {
        type: 'object',
        required: true,
        description: 'Technologies to use',
        example: {
          frontend: 'React',
          backend: 'Node.js',
          database: 'PostgreSQL',
          styling: 'Tailwind CSS',
        },
      },
      projectType: {
        type: 'string',
        required: false,
        default: 'component',
        enum: ['component', 'page', 'feature', 'project'],
        description: 'Scope of the generation',
      },
    },
    response_schema: {
      success: true,
      data: {
        files: [
          {
            path: 'components/TodoList.tsx',
            content: '// Generated code...',
          },
        ],
        instructions: 'How to use the generated code',
        metadata: {
          project_type: 'component',
          lines_of_code: 150,
          tokens_used: 1234,
          generation_time_ms: 5000,
          credits_consumed: 1,
          credits_remaining: 999,
        },
      },
      timestamp: '2025-11-22T12:00:00Z',
    },
    example_curl: `curl -X POST https://afrinova.com/api/v1/generate \\
  -H "Authorization: Bearer afn_live_xxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Create a todo list app",
    "techStack": {
      "frontend": "React",
      "styling": "Tailwind CSS"
    },
    "projectType": "component"
  }'`,
    documentation: 'https://github.com/SyncSphere7/AfriNova-App/blob/main/API_PRICING.md',
  });
}
