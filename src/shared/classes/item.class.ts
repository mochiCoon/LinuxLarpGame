import { TweenService } from "@rbxts/services";

export abstract class Item {
	protected model: Model;
	constructor(model: Model) {
		this.model = model;
	}

	public setParentPoint(newParentPoint: Attachment, tweenSpeed: number):void {
        const tweenInfo = new TweenInfo(
            tweenSpeed,
            Enum.EasingStyle.Back,
            Enum.EasingDirection.Out,
            0,
            false,
            0,
        );

        const cframeValue = new Instance("CFrameValue");
        cframeValue.Value = this.model.GetPivot();

        const connection = cframeValue.Changed.Connect((newCFrame: CFrame) => {
            this.model.PivotTo(newCFrame);
        });

        const tween = TweenService.Create(cframeValue, tweenInfo, {
            Value: newParentPoint.WorldCFrame,
        });

        tween.Completed.Connect((playbackState) => {
            connection.Disconnect();
            cframeValue.Destroy();

            if (playbackState === Enum.PlaybackState.Completed) {
                this.model.Parent = newParentPoint.Parent;
            }
        });

        tween.Play();
    }

    public async destroy(): Promise<void> {
        const tweenInfo = new TweenInfo(
            0.4,
            Enum.EasingStyle.Back,
            Enum.EasingDirection.In,
            0,
            false,
            0,
        );

        const scaleValue = new Instance("NumberValue");
        scaleValue.Value = 1;

        const connection = scaleValue.Changed.Connect((newScale: number) => {
            this.model.ScaleTo(math.max(newScale, 0.001));
        });

        const tween = TweenService.Create(scaleValue, tweenInfo, {
            Value: 0.001,
        });

        tween.Completed.Connect((playbackState) => {
            connection.Disconnect();
            scaleValue.Destroy();

            if (playbackState === Enum.PlaybackState.Completed) {
                this.model.Destroy();
            }
        });

        tween.Play();
    }
}