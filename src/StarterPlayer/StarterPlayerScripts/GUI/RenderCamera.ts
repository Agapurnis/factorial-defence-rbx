export const RenderCamera = new Instance("Camera");
RenderCamera.Name = "RenderCamera";
RenderCamera.Parent = game.Workspace;
RenderCamera.CameraType = Enum.CameraType.Scriptable;
RenderCamera.CFrame = CFrame.lookAt(new Vector3(3, 4, 0), new Vector3(0, 0, 0));


