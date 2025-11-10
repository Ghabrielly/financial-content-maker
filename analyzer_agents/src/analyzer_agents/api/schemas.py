from pydantic import BaseModel
from typing import Optional

class TopicRequest(BaseModel):
    topic: Optional[str] = None