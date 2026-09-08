import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

declare const API_URL: string;

export type CurrentSituation =
  | 'student'
  | 'workingProfessional'
  | 'studentAndWorkingProfessional'
  | 'seekingOpportunity';

export type InterestArea =
  | 'artificialIntelligence'
  | 'data'
  | 'development'
  | 'cybersecurity'
  | 'cloud'
  | 'other';

export type ExperienceLevel =
  | 'noExperience'
  | 'upToTwoYears'
  | 'twoToFiveYears'
  | 'moreThanFiveYears';

export type Technology = 'java' | 'cSharp' | 'python' | 'javascript/typescript' | 'sql' | 'other';

export type CareerPriority = 'salary' | 'remoteWork' | 'purpose' | 'stability' | 'learning';

export interface CreateSubmissionDto {
  participationConsent: boolean;
  academicUseConsent: boolean;
  name: string;
  email: string;
  currentSituation: CurrentSituation;
  interestArea: InterestArea;
  experienceLevel: ExperienceLevel;
  technologies: Technology[];
  marketConfidence: number;
  careerPriorities: CareerPriority[];
  recommendationScore: number;
  age: number;
  salaryExpectation: number;
  usesAi: boolean;
  additionalComments: string;
}

export interface SubmissionResponse {
  message: string;
}

const apiBaseUrl = API_URL.replace(/\/$/, '');

@Injectable({ providedIn: 'root' })
export class SubmissionService {
  private readonly http = inject(HttpClient);

  createSubmission(payload: CreateSubmissionDto): Observable<SubmissionResponse> {
    return this.http.post<SubmissionResponse>(`${apiBaseUrl}/submission`, payload);
  }
}
