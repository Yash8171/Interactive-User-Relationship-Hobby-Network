export interface CustomNodeData {
  id: string;
  label: string;
  popularity: number;
  hobbies?: string[];
  onHobbyDrop?: (nodeId: string, hobby: string) => void;
}
