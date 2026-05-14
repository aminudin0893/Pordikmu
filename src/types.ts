export interface TeacherInfo {
  name: string;
  nip?: string;
  school: string;
  subject: string;
  phaseGrade: string;
  semester: string;
  schoolYear: string;
}

export interface RPPConfig extends TeacherInfo {
  topic: string;
  learningModel: string;
  timeAllocation: string;
  meetingsCount: string;
  additionalNotes?: string;
  useLetterhead: boolean;
  useValidationPage: boolean;
}

export interface SoalConfig extends TeacherInfo {
  topic: string;
  assessmentType: string;
  optionsCount: string;
  cognitiveLevels: string[];
  difficultyDist: {
    easy: number;
    medium: number;
    hard: number;
  };
  typesDist: {
    mcq: number;
    multiResponse: number;
    trueFalse: number;
    shortAnswer: number;
    essay: number;
    matchTable: number;
  };
  specialInstructions?: string;
}

export interface MateriConfig extends TeacherInfo {
  topic: string;
  depthLevel: 'basic' | 'intermediate' | 'advanced';
  includeAnalogy: boolean;
  includeIllustration: boolean;
  targetFocus: string;
}
