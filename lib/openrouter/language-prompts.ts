import type { LanguageCode } from '@/lib/i18n/languages';

/**
 * Language-specific instructions for AI agents
 * Tells the AI to generate code comments in the user's native language
 */
export interface LanguageInstructions {
  code: LanguageCode;
  name: string;
  nativeName: string;
  commentInstruction: string;
  responseInstruction: string;
  examples: {
    variable: string;
    function: string;
    validation: string;
  };
}

/**
 * Multilingual code generation instructions
 * Maps each supported language to specific AI instructions
 */
export const LANGUAGE_INSTRUCTIONS: Record<LanguageCode, LanguageInstructions> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    commentInstruction: 'Write all code comments in English.',
    responseInstruction: 'Respond to the user in English.',
    examples: {
      variable: '// User authentication status',
      function: '// Validate email format and check if email exists in database',
      validation: '// Check if password meets security requirements (8+ chars, uppercase, number)',
    },
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    commentInstruction: 'Écrivez tous les commentaires de code en français.',
    responseInstruction: 'Répondez à l\'utilisateur en français.',
    examples: {
      variable: '// Statut d\'authentification de l\'utilisateur',
      function: '// Valider le format de l\'email et vérifier si l\'email existe dans la base de données',
      validation: '// Vérifier si le mot de passe répond aux exigences de sécurité (8+ caractères, majuscule, chiffre)',
    },
  },
  sw: {
    code: 'sw',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    commentInstruction: 'Andika maoni yote ya msimbo kwa Kiswahili.',
    responseInstruction: 'Jibu mtumiaji kwa Kiswahili.',
    examples: {
      variable: '// Hali ya uthibitishaji wa mtumiaji',
      function: '// Thibitisha muundo wa barua pepe na angalia kama barua pepe ipo kwenye hifadhidata',
      validation: '// Angalia kama nenosiri linakidhi mahitaji ya usalama (herufi 8+, herufi kubwa, nambari)',
    },
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    commentInstruction: 'اكتب جميع تعليقات الكود باللغة العربية.',
    responseInstruction: 'أجب على المستخدم باللغة العربية.',
    examples: {
      variable: '// حالة مصادقة المستخدم',
      function: '// التحقق من صحة تنسيق البريد الإلكتروني والتحقق من وجود البريد الإلكتروني في قاعدة البيانات',
      validation: '// تحقق من أن كلمة المرور تلبي متطلبات الأمان (8+ أحرف، حرف كبير، رقم)',
    },
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    commentInstruction: 'Escreva todos os comentários do código em português.',
    responseInstruction: 'Responda ao usuário em português.',
    examples: {
      variable: '// Status de autenticação do usuário',
      function: '// Validar formato de email e verificar se o email existe no banco de dados',
      validation: '// Verificar se a senha atende aos requisitos de segurança (8+ caracteres, maiúscula, número)',
    },
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    commentInstruction: 'Escribe todos los comentarios del código en español.',
    responseInstruction: 'Responde al usuario en español.',
    examples: {
      variable: '// Estado de autenticación del usuario',
      function: '// Validar formato de email y verificar si el email existe en la base de datos',
      validation: '// Verificar si la contraseña cumple los requisitos de seguridad (8+ caracteres, mayúscula, número)',
    },
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    commentInstruction: '用中文编写所有代码注释。',
    responseInstruction: '用中文回复用户。',
    examples: {
      variable: '// 用户认证状态',
      function: '// 验证电子邮件格式并检查数据库中是否存在该电子邮件',
      validation: '// 检查密码是否符合安全要求（8位以上，大写字母，数字）',
    },
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    commentInstruction: 'सभी कोड टिप्पणियाँ हिंदी में लिखें।',
    responseInstruction: 'उपयोगकर्ता को हिंदी में उत्तर दें।',
    examples: {
      variable: '// उपयोगकर्ता प्रमाणीकरण स्थिति',
      function: '// ईमेल प्रारूप मान्य करें और जांचें कि डेटाबेस में ईमेल मौजूद है',
      validation: '// जांचें कि पासवर्ड सुरक्षा आवश्यकताओं को पूरा करता है (8+ वर्ण, अपरकेस, संख्या)',
    },
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    commentInstruction: 'Schreiben Sie alle Code-Kommentare auf Deutsch.',
    responseInstruction: 'Antworten Sie dem Benutzer auf Deutsch.',
    examples: {
      variable: '// Benutzer-Authentifizierungsstatus',
      function: '// E-Mail-Format validieren und prüfen, ob E-Mail in Datenbank existiert',
      validation: '// Prüfen, ob Passwort Sicherheitsanforderungen erfüllt (8+ Zeichen, Großbuchstabe, Zahl)',
    },
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    commentInstruction: 'すべてのコードコメントを日本語で書いてください。',
    responseInstruction: 'ユーザーに日本語で返信してください。',
    examples: {
      variable: '// ユーザー認証ステータス',
      function: '// メール形式を検証し、データベースにメールが存在するか確認',
      validation: '// パスワードがセキュリティ要件を満たしているか確認（8文字以上、大文字、数字）',
    },
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    commentInstruction: '모든 코드 주석을 한국어로 작성하세요.',
    responseInstruction: '사용자에게 한국어로 답변하세요.',
    examples: {
      variable: '// 사용자 인증 상태',
      function: '// 이메일 형식 검증 및 데이터베이스에 이메일 존재 여부 확인',
      validation: '// 비밀번호가 보안 요구사항을 충족하는지 확인 (8자 이상, 대문자, 숫자)',
    },
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    commentInstruction: 'Пишите все комментарии к коду на русском языке.',
    responseInstruction: 'Отвечайте пользователю на русском языке.',
    examples: {
      variable: '// Статус аутентификации пользователя',
      function: '// Проверить формат email и проверить наличие email в базе данных',
      validation: '// Проверить, соответствует ли пароль требованиям безопасности (8+ символов, заглавная буква, цифра)',
    },
  },
  id: {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    commentInstruction: 'Tulis semua komentar kode dalam Bahasa Indonesia.',
    responseInstruction: 'Balas pengguna dalam Bahasa Indonesia.',
    examples: {
      variable: '// Status autentikasi pengguna',
      function: '// Validasi format email dan periksa apakah email ada di database',
      validation: '// Periksa apakah password memenuhi persyaratan keamanan (8+ karakter, huruf besar, angka)',
    },
  },
  th: {
    code: 'th',
    name: 'Thai',
    nativeName: 'ไทย',
    commentInstruction: 'เขียนคอมเมนต์โค้ดทั้งหมดเป็นภาษาไทย',
    responseInstruction: 'ตอบกลับผู้ใช้เป็นภาษาไทย',
    examples: {
      variable: '// สถานะการยืนยันตัวตนของผู้ใช้',
      function: '// ตรวจสอบรูปแบบอีเมลและตรวจสอบว่าอีเมลมีอยู่ในฐานข้อมูลหรือไม่',
      validation: '// ตรวจสอบว่ารหัสผ่านตรงตามข้อกำหนดความปลอดภัย (8+ ตัวอักษร ตัวพิมพ์ใหญ่ ตัวเลข)',
    },
  },
  vi: {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    commentInstruction: 'Viết tất cả các chú thích mã bằng tiếng Việt.',
    responseInstruction: 'Trả lời người dùng bằng tiếng Việt.',
    examples: {
      variable: '// Trạng thái xác thực người dùng',
      function: '// Xác thực định dạng email và kiểm tra email có tồn tại trong cơ sở dữ liệu',
      validation: '// Kiểm tra mật khẩu có đáp ứng yêu cầu bảo mật (8+ ký tự, chữ hoa, số)',
    },
  },
  tl: {
    code: 'tl',
    name: 'Tagalog',
    nativeName: 'Tagalog',
    commentInstruction: 'Isulat ang lahat ng code comments sa Tagalog.',
    responseInstruction: 'Sumagot sa user sa Tagalog.',
    examples: {
      variable: '// Katayuan ng authentication ng user',
      function: '// I-validate ang format ng email at tingnan kung ang email ay umiiral sa database',
      validation: '// Suriin kung ang password ay nakakatugon sa mga kinakailangan sa seguridad (8+ character, uppercase, numero)',
    },
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    commentInstruction: 'Scrivi tutti i commenti del codice in italiano.',
    responseInstruction: 'Rispondi all\'utente in italiano.',
    examples: {
      variable: '// Stato di autenticazione dell\'utente',
      function: '// Convalidare il formato email e verificare se l\'email esiste nel database',
      validation: '// Verificare se la password soddisfa i requisiti di sicurezza (8+ caratteri, maiuscola, numero)',
    },
  },
  nl: {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    commentInstruction: 'Schrijf alle code-opmerkingen in het Nederlands.',
    responseInstruction: 'Antwoord de gebruiker in het Nederlands.',
    examples: {
      variable: '// Gebruiker authenticatiestatus',
      function: '// E-mailformaat valideren en controleren of e-mail bestaat in database',
      validation: '// Controleer of wachtwoord voldoet aan beveiligingseisen (8+ tekens, hoofdletter, getal)',
    },
  },
  pl: {
    code: 'pl',
    name: 'Polish',
    nativeName: 'Polski',
    commentInstruction: 'Pisz wszystkie komentarze do kodu po polsku.',
    responseInstruction: 'Odpowiadaj użytkownikowi po polsku.',
    examples: {
      variable: '// Status uwierzytelnienia użytkownika',
      function: '// Sprawdź format email i sprawdź czy email istnieje w bazie danych',
      validation: '// Sprawdź czy hasło spełnia wymagania bezpieczeństwa (8+ znaków, wielka litera, cyfra)',
    },
  },
  tr: {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    commentInstruction: 'Tüm kod yorumlarını Türkçe yazın.',
    responseInstruction: 'Kullanıcıya Türkçe yanıt verin.',
    examples: {
      variable: '// Kullanıcı kimlik doğrulama durumu',
      function: '// E-posta formatını doğrula ve e-postanın veritabanında var olup olmadığını kontrol et',
      validation: '// Şifrenin güvenlik gereksinimlerini karşılayıp karşılamadığını kontrol et (8+ karakter, büyük harf, sayı)',
    },
  },
};

/**
 * Generate language-specific system prompt addition
 * Injects multilingual instructions into the AI agent's system prompt
 * 
 * @param languageCode - User's preferred language (en, fr, sw, ar, pt, etc.)
 * @returns Multilingual instruction to append to system prompt
 */
export function getMultilingualInstructions(languageCode: LanguageCode = 'en'): string {
  const lang = LANGUAGE_INSTRUCTIONS[languageCode] || LANGUAGE_INSTRUCTIONS.en;

  if (languageCode === 'en') {
    // Default English - no special instructions needed
    return '';
  }

  return `

## 🌍 MULTILINGUAL CODE GENERATION
====================================

**User's Language:** ${lang.nativeName} (${lang.name})

**CRITICAL INSTRUCTIONS:**
1. ${lang.commentInstruction}
2. ${lang.responseInstruction}
3. Keep ALL code syntax in English (variable names, function names, imports)
4. Only translate COMMENTS and DOCUMENTATION
5. Use native language for user-facing strings (UI text, error messages)

**Examples of ${lang.nativeName} comments:**

\`\`\`typescript
${lang.examples.variable}
const isAuthenticated = checkAuth();

${lang.examples.function}
async function validateEmail(email: string): Promise<boolean> {
  ${lang.examples.validation}
  return email.includes('@') && email.length > 5;
}
\`\`\`

**DO:**
- ✅ Write comments in ${lang.nativeName}
- ✅ Keep code syntax in English
- ✅ Translate UI strings (buttons, labels, messages)
- ✅ Explain your reasoning in ${lang.nativeName}

**DON'T:**
- ❌ Translate variable names
- ❌ Translate function names
- ❌ Translate library/package names
- ❌ Mix languages in the same comment

AfriNova is the ONLY AI coding platform with multilingual code generation.
Make the user proud! 🚀
`;
}

/**
 * Get human-readable language name for display
 */
export function getLanguageName(code: LanguageCode): string {
  return LANGUAGE_INSTRUCTIONS[code]?.name || 'English';
}

/**
 * Get native language name (e.g., "Français" instead of "French")
 */
export function getNativeLanguageName(code: LanguageCode): string {
  return LANGUAGE_INSTRUCTIONS[code]?.nativeName || 'English';
}
