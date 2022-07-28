import { Double } from "mongodb";

export class AwsCompareFacesRequest {
    SourceImage: Image;
    TargetImage: Image;
    SimilarityThreshold?: Percent;
    QualityFilter?: QualityFilter;
}

export class AwsDetectFacesRequest {
    Image: Image;
    Attributes?: Attributes;
}

export interface Image {
    Bytes?: ImageBlob;
    S3Object?: S3Object;
}

export interface S3Object {
    Bucket?: S3Bucket;
    Name?: S3ObjectName;
    Version?: S3ObjectVersion;
}

export type Attribute = "DEFAULT" | "ALL" | string;
export type Attributes = Attribute[];
export type QualityFilter = "NONE" | "AUTO" | "LOW" | "MEDIUM" | "HIGH" | string;
export type Percent = number;
export type ImageBlob = Buffer | Uint8Array | Blob | string;
export type S3Bucket = string; 
export type S3ObjectName = string;
export type S3ObjectVersion = string;

export class AwsCompareFacesResponse {
    SourceImageFace?: ComparedSourceImageFace;
    FaceMatches?: CompareFacesMatchList;
    UnmatchedFaces?: CompareFacesUnmatchList;
    SourceImageOrientationCorrection?: OrientationCorrection;
    TargetImageOrientationCorrection?: OrientationCorrection;
}

export interface ComparedSourceImageFace {
    BoundingBox?: BoundingBox;
    Confidence?: Percent;
}
export interface BoundingBox {
    Width?: Float;
    Height?: Float;
    Left?: Float;
    Top?: Float;
}

export type Float = number;
export type CompareFacesMatchList = CompareFacesMatch[];
export type CompareFacesUnmatchList = ComparedFace[];

export interface CompareFacesMatch {
    Similarity?: Percent;
    Face?: ComparedFace;
}

export interface ComparedFace {
    BoundingBox?: BoundingBox;
    Confidence?: Percent;
    Landmarks?: Landmarks;
    Pose?: Pose;
    Quality?: ImageQuality;
    Emotions?: Emotions;
    Smile?: Smile;
}

export type Landmarks = Landmark[];


export interface Landmark {
    Type?: LandmarkType;
    X?: Float;
    Y?: Float;
}

export type LandmarkType = "eyeLeft" | "eyeRight" | "nose" | "mouthLeft" | "mouthRight" | "leftEyeBrowLeft" | "leftEyeBrowRight" | "leftEyeBrowUp" | "rightEyeBrowLeft" | "rightEyeBrowRight" | "rightEyeBrowUp" | "leftEyeLeft" | "leftEyeRight" | "leftEyeUp" | "leftEyeDown" | "rightEyeLeft" | "rightEyeRight" | "rightEyeUp" | "rightEyeDown" | "noseLeft" | "noseRight" | "mouthUp" | "mouthDown" | "leftPupil" | "rightPupil" | "upperJawlineLeft" | "midJawlineLeft" | "chinBottom" | "midJawlineRight" | "upperJawlineRight" | string;

export interface Pose {
    Roll?: Degree;
    Yaw?: Degree;
    Pitch?: Degree;
}

export type Degree = number;

export interface ImageQuality {
    Brightness?: Float;
    Sharpness?: Float;
}

export type Emotions = Emotion[];

export interface Emotion {
    Type?: EmotionName;
    Confidence?: Percent;
}

export type EmotionName = "HAPPY" | "SAD" | "ANGRY" | "CONFUSED" | "DISGUSTED" | "SURPRISED" | "CALM" | "UNKNOWN" | "FEAR" | string;

export interface Smile {
    Value?: Boolean;
    Confidence?: Percent;
}

export type OrientationCorrection = "ROTATE_0" | "ROTATE_90" | "ROTATE_180" | "ROTATE_270" | string;

export class AwsDetectFacesResponse {
    FaceDetails?: FaceDetailList;
    OrientationCorrection?: OrientationCorrection;
}

export type FaceDetailList = FaceDetail[];

export interface FaceDetail {
    BoundingBox?: BoundingBox;
    AgeRange?: AgeRange;
    Smile?: Smile;
    Eyeglasses?: Eyeglasses;
    Sunglasses?: Sunglasses;
    Gender?: Gender;
    Beard?: Beard;
    Mustache?: Mustache;
    EyesOpen?: EyeOpen;
    MouthOpen?: MouthOpen;
    Emotions?: Emotions;
    Landmarks?: Landmarks;
    Pose?: Pose;
    Quality?: ImageQuality;
    Confidence?: Percent;
}

export interface AgeRange {
    Low?: UInteger;
    High?: UInteger;
}

export type UInteger = number;

export interface Eyeglasses {
    Value?: Boolean;
    Confidence?: Percent;
}

export interface Gender {
    Value?: GenderType;
    Confidence?: Percent;
}

export interface Sunglasses {
    Value?: Boolean;
    Confidence?: Percent;
}

export type GenderType = "Male" | "Female" | string;

export interface Beard {
    Value?: Boolean;
    Confidence?: Percent;
}

export interface Mustache {
    Value?: Boolean;
    Confidence?: Percent;
}

export interface EyeOpen {
    Value?: Boolean;
    Confidence?: Percent;
}

export interface MouthOpen {
    Value?: Boolean;
    Confidence?: Percent;
}