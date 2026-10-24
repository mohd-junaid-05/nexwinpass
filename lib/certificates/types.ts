export type CertificateType = "participation" | "completion";

export interface CertificateFieldBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CertificateFieldMask {
  color?: string;
  sliceY?: number;
  sliceHeight?: number;
}

export interface CertificateField {
  id: string;
  dataKey:
    | "name"
    | "team"
    | "track"
    | "role"
    | "body"
    | "project"
    | "dates"
    | "event"
    | "organizer"
    | "certificateId";
  box: CertificateFieldBox;
  align: "left" | "center" | "right";
  fontFamily: string;
  weight?: string;
  color: string;
  largestSize: number;
  smallestSize: number;
  maxLines: number;
  casing: "as-is" | "title" | "upper";
  label: string; // Used by dev placement overlay
  mask?: CertificateFieldMask;
}

export interface CertificateTemplate {
  id: CertificateType;
  title: string;
  badgeLabel: string;
  description: string;
  ineligibleReason: string;
  width: number;
  height: number;
  backgroundPath: string;
  hasCertificateId: boolean;
  fields: CertificateField[];
}

export interface ParticipantCertificateData {
  name: string;
  team: string;
  teamId: string;
  track: number;
  role: string;
  certificateId: string;
  projectName?: string;
}

export interface ServerCertificatesState {
  participation: {
    eligible: boolean;
    id: string | null;
  };
  completion: {
    eligible: boolean;
    id: string | null;
  };
}
