"""Jersey number OCR using PaddleOCR/EasyOCR."""

import cv2
import numpy as np
import logging
import re
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from typing import Optional, List

logger = logging.getLogger(__name__)


@dataclass
class OCRResult:
    """Single OCR result."""
    text: str
    confidence: float
    bbox: Tuple[float, float, float, float]  # x1, y1, x2, y2
    track_id: Optional[int] = None


class JerseyOCR:
    """Jersey number recognition using PaddleOCR/EasyOCR."""
    
    def __init__(
        self,
        engine: str = "paddleocr",
        languages: List[str] = None,
        use_gpu: bool = True,
        det_model_dir: str = None,
        rec_model_dir: str = None,
        cls_model_dir: str = None,
    ):
        self.engine = engine
        self.languages = languages or ["en"]
        self.use_gpu = use_gpu
        
        if engine == "paddleocr":
            self._init_paddleocr(
                det_model_dir, rec_model_dir, cls_model_dir, use_gpu
            )
        elif engine == "easyocr":
            self._init_easyocr(languages, use_gpu)
        else:
            raise ValueError(f"Unsupported OCR engine: {engine}")
    
    def _init_paddleocr(
        self, 
        det_model_dir: str, 
        rec_model_dir: str, 
        cls_model_dir: str,
        use_gpu: bool
    ):
        from paddleocr import PaddleOCR
        
        self.ocr = PaddleOCR(
            use_angle_cls=True,
            lang="en",
            det_model_dir=det_model_dir,
            rec_model_dir=rec_model_dir,
            cls_model_dir=cls_model_dir,
            use_gpu=use_gpu,
            use_angle_cls=True,
            det_db_thresh=0.3,
            det_db_box_thresh=0.5,
            rec_batch_num=6,
            max_text_length=2,
            use_space_char=False,
            show_log=False
        )
    
    def _init_easyocr(self, languages: List[str], use_gpu: bool):
        import easyocr
        self.reader = easyocr.Reader(languages, gpu=self.use_gpu)
    
    def recognize(self, image: np.ndarray, bboxes: List[Tuple]) -> List[Dict]:
        """
        Recognize jersey numbers in detected player crops.
        
        Args:
            image: Full frame image
            bboxes: List of player bounding boxes (x1, y1, x2, y2)
            
        Returns:
            List of OCR results for each player
        """
        results = []
        
        for i, bbox in enumerate(bboxes):
            x1, y1, x2, y2 = map(int, bbox)
            
            # Expand bbox slightly for better OCR context
            h, w = image.shape[:2]
            x1, y1, x2, y2 = bbox
            pad_x = int((bbox[2] - bbox[0]) * 0.1)
            pad_y = int((bbox[3] - bbox[1]) * 0.1)
            
            x1 = max(0, int(x1) - 10)
            y1 = max(0, int(y1) - 10)
            x2 = min(image.shape[1], int(x2) + 10)
            y2 = min(image.shape[0], int(y2) + 10)
            
            crop = image[y1:y2, x1:x2]
            
            if crop.size == 0:
                continue
            
            # Preprocess for OCR
            processed = self._preprocess_for_ocr(crop)
            
            # Run OCR
            if hasattr(self, 'ocr'):  # PaddleOCR
                result = self.ocr.ocr(crop, cls=True)
                texts = []
                confidences = []
                
                if result and result[0]:
                    for line in result[0]:
                        text = line[1][0]
                        conf = line[1][1]
                        # Filter for numbers only
                        cleaned = re.sub(r'[^0-9]', '', text)
                        if cleaned:
                            texts.append(cleaned)
                            confidences.append(conf)
                
                if texts:
                    # Pick highest confidence number
                    best_idx = np.argmax(confidences)
                    best_text = texts[best_idx]
                    best_conf = confidences[best_idx]
                    
                    # Validate number range (0-99 for volleyball)
                    if best_text.isdigit() and 0 <= int(best_text) <= 99:
                        return {
                            "jersey_number": int(best_text),
                            "confidence": float(confidences[best_idx]),
                            "bbox": bbox,
                            "raw_texts": texts,
                            "raw_confidences": confidences
                        }
            
            elif hasattr(self, 'reader'):  # EasyOCR
                results = self.reader.readtext(crop, detail=1)
                # Similar processing...
                
        return []
    
    def _preprocess_for_ocr(self, crop: np.ndarray) -> np.ndarray:
        """Preprocess crop for better OCR accuracy."""
        # Resize to minimum height for better OCR
        h, w = crop.shape[:2]
        if h < 64:
            scale = 64 / crop.shape[0]
            crop = cv2.resize(crop, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
        
        # Enhance contrast
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l = clahe.apply(l)
        enhanced = cv2.merge((l, a, b))
        enhanced = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
        
        return enhanced
    
    def recognize_jersey_number(
        self, 
        frame: np.ndarray, 
        player_bbox: Tuple[float, float, float, float],
        track_id: int
    ) -> Optional[Dict]:
        """
        Recognize jersey number for a single player.
        
        Args:
            frame: Full frame image
            player_bbox: Player bounding box (x1, y1, x2, y2)
            track_id: Player track ID
            
        Returns:
            OCR result dict or None
        """
        x1, y1, x2, y2 = map(int, player_bbox)
        
        # Crop player torso region (upper body for jersey)
        h, w = image.shape[:2]
        x1 = max(0, int(bbox[0]) - 10)
        y1 = max(0, int(bbox[1]) - 10)
        x2 = min(image.shape[1], int(bbox[2]) + 10)
        y2 = min(image.shape[0], int(bbox[3]) + 10)
        
        # Focus on upper torso (jersey area)
        torso_y2 = int(y1 + (y2 - y1) * 0.6)
        crop = image[y1:torso_y2, x1:x2]
        
        if crop.size == 0:
            return None
        
        # Preprocess
        processed = self._preprocess_for_ocr(crop)
        
        # Run OCR
        results = self.ocr.ocr(processed, cls=True)
        
        if not results or not results[0]:
            return None
        
        # Parse results - look for numbers 0-99
        best_result = None
        best_conf = 0.0
        
        for line in results[0]:
            text, (conf, _) = line[1][0], line[1][1]
            
            # Clean text - keep only digits
            cleaned = re.sub(r'[^0-9]', '', text)
            
            if cleaned and conf > 0.5:
                try:
                    number = int(cleaned)
                    if 0 <= number <= 99:  # Valid volleyball jersey range
                        if conf > best_conf:
                            best_conf = conf
                            best_result = {
                                "jersey_number": number,
                                "confidence": conf,
                                "bbox": (x1, y1, x2, y2),
                                "track_id": None,  # Set by caller
                                "raw_text": text
                            }
                except ValueError:
                    continue
        
        return best_result


def create_ocr(config) -> JerseyOCR:
    """Factory function to create OCR instance from config."""
    return JerseyOCR(
        engine=config.ocr_engine,
        languages=["en"],
        use_gpu=config.device.startswith("cuda"),
        det_model_dir=config.ocr_det_model_dir,
        rec_model_dir=config.ocr_rec_model_dir,
        cls_model_dir=config.ocr_cls_model_dir
    )