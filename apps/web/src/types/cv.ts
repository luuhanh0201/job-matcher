export enum CvProcessingRequestStatus {
    PENDING = "pending",
    NOT_FOUND = "not_found",
}

export enum CvProcessingState {
    WAITING = "waiting",
    ACTIVE = "active",
    COMPLETED = "completed",
    FAILED = "failed",
    DELAYED = "delayed",
    PAUSED = "paused",
    WAITING_CHILDREN = "waiting-children",
}

export enum CvProcessingResultStatus {
    COMPLETED = "completed",
    FAILED = "failed",
}

export type CvRecord = {
    id: number;
    [key: string]: unknown;
};

export type CvPayload = Record<string, unknown>;

export type ParsedCvForm = {
    candidateName?: string;
    email?: string;
    phone?: string;
    totalExperienceYears?: string;
    currentTitle?: string;
    skills?: string;
    education?: string;
    workExperience?: string;
    certifications?: string;
    languages?: string;
};

export type ExtractedCvData = {
    candidateName: string;
    currentTitle: string;
    email: string;
    phone: string;
    totalExperienceYears: string;
    skills: string[];
    education: Array<{
        school: string;
        degree: string;
        major: string;
        time: string;
    }>;
    workExperience: Array<{
        company: string;
        position: string;
        time: string;
        description: string;
    }>;
    certifications: string[];
    languages: string[];
};

export type UploadCvResponse = {
    cv: CvRecord;
    cvId: string;
    status: "PENDING" | "COMPLETED" | "FAILED";
    message: string;
    parsedText: string;
};

export type CvProcessingStatus = {
    id?: string;
    name?: string;
    state?: CvProcessingState;
    progress?: number;
    data?: { cvDocumentId?: string };
    parsedData?: ParsedCvForm | null;
    result?: {
        cvDocumentId?: string;
        status?: CvProcessingResultStatus;
        parsedData?: ParsedCvForm;
    };
    failedReason?: string | null;
    attemptsMade?: number;
    status?: CvProcessingRequestStatus;
};
