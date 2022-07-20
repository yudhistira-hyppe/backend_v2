import { ByteBuffer } from "aws-sdk/clients/cloudtrail";
import { double } from "aws-sdk/clients/lightsail";
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
    Confidence: double;
    Pose: Pose;
    Quality: Quality;
    Landmarks: Array<Landmarks>;
}

export class BoundingBox {
    Width: double;
    Top: double;
    Left: double;
    Height: double;
}

export class Pose {
    Yaw: double;
    Roll: double;
    Pitch: double;
} 

export class Quality {
    Sharpness: double;
    Brightness: double;
}

export class Landmarks {
    X: double;
    Y: double;
    Type: string;
}

export class UnmatchedFaces {
    BoundingBox: BoundingBox;
    Confidence: double;
    Pose: Pose;
    Quality: Quality;
    Landmarks: Array<Landmarks>;
}

export class SourceImageFace {
    BoundingBox: BoundingBox;
    Confidence: double;
    Pose: Pose;
    Quality: Quality;
    Landmarks: Array<Landmarks>;
}