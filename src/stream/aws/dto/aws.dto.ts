import { Double } from "mongodb";

export class AwsRequest {
    SourceImage: {
        Bytes: string;
    };
    TargetImage: {
        Bytes: string;
    };
    SimilarityThreshold: number;
}

export class ImageDataRequest {
    Bytes: string;
    S3Object: {
        Bucket: string,
        Name: string
    };
}

export class AwsResponse {
    FaceMatches: Array<FaceMatches>;
    SourceImageOrientationCorrection: string;
    TargetImageOrientationCorrection: string;
    UnmatchedFaces: number;
}

export class FaceMatches {
    Face: Face;
    Similarity: number;
}

export class Face {
    BoundingBox: BoundingBox;
    Confidence: Double;
    Pose: Pose;
    Quality: Quality;
    Landmarks: Array<Landmarks>;
}

export class BoundingBox {
    Width: Double;
    Top: Double;
    Left: Double;
    Height: Double;
}

export class Pose {
    Yaw: Double;
    Roll: Double;
    Pitch: Double;
} 

export class Quality {
    Sharpness: Double;
    Brightness: Double;
}

export class Landmarks {
    X: Double;
    Y: Double;
    Type: string;
}

export class UnmatchedFaces {
    BoundingBox: BoundingBox;
    Confidence: Double;
    Pose: Pose;
    Quality: Quality;
    Landmarks: Array<Landmarks>;
}

export class SourceImageFace {
    BoundingBox: BoundingBox;
    Confidence: Double;
    Pose: Pose;
    Quality: Quality;
    Landmarks: Array<Landmarks>;
}