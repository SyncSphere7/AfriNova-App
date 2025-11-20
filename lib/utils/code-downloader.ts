import JSZip from 'jszip';

export interface FileStructure {
  files?: Array<{ path: string; content: string; description?: string }>;
  instructions?: string;
  frontend?: Record<string, string>;
  backend?: Record<string, string>;
  database?: Record<string, string>;
  tests?: Record<string, string>;
  config?: {
    readme: string;
    packageJson: string;
    envExample?: string;
  };
}

export async function downloadProjectAsZip(
  projectName: string,
  codeStructure: FileStructure
): Promise<void> {
  const zip = new JSZip();

  if (codeStructure.files && codeStructure.files.length > 0) {
    codeStructure.files.forEach((file) => {
      const pathParts = file.path.split('/');
      if (pathParts.length > 1) {
        const fileName = pathParts.pop()!;
        let currentFolder = zip;
        pathParts.forEach(folderName => {
          currentFolder = currentFolder.folder(folderName) as JSZip;
        });
        currentFolder.file(fileName, file.content);
      } else {
        zip.file(file.path, file.content);
      }
    });

    if (codeStructure.instructions) {
      zip.file('SETUP.md', codeStructure.instructions);
    }
  } else {
    if (codeStructure.frontend) {
      const frontendFolder = zip.folder('frontend');
      Object.entries(codeStructure.frontend).forEach(([fileName, content]) => {
        frontendFolder?.file(fileName, content);
      });
    }

    if (codeStructure.backend) {
      const backendFolder = zip.folder('backend');
      Object.entries(codeStructure.backend).forEach(([fileName, content]) => {
        backendFolder?.file(fileName, content);
      });
    }

    if (codeStructure.database) {
      const dbFolder = zip.folder('database');
      Object.entries(codeStructure.database).forEach(([fileName, content]) => {
        dbFolder?.file(fileName, content);
      });
    }

    if (codeStructure.tests) {
      const testsFolder = zip.folder('tests');
      Object.entries(codeStructure.tests).forEach(([fileName, content]) => {
        testsFolder?.file(fileName, content);
      });
    }

    if (codeStructure.config) {
      if (codeStructure.config.readme) {
        zip.file('README.md', codeStructure.config.readme);
      }
      if (codeStructure.config.packageJson) {
        zip.file('package.json', codeStructure.config.packageJson);
      }
      if (codeStructure.config.envExample) {
        zip.file('.env.example', codeStructure.config.envExample);
      }
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${projectName.replace(/\s+/g, '-').toLowerCase()}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadSingleFile(fileName: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
