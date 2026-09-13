import { Item } from "./item.class";
import { TweenService, RunService, UserInputService } from "@rbxts/services";

export class test extends Item {


    private spinConnection?: RBXScriptConnection;

    private spin(durationSeconds = 3): void {
        const spin: Sound = this.model.WaitForChild("Spin") as Sound
        print("WEEEE SPINNY SPIN SPIN :P");
        const startCFrame = this.model.GetPivot();
        const startTime = os.clock();
        spin.Play();
        this.spinConnection = RunService.Heartbeat.Connect(() => {
            const elapsed = os.clock() - startTime;
            const linearAlpha = math.min(elapsed / durationSeconds, 1);

            const easedAlpha = TweenService.GetValue(
                linearAlpha,
                Enum.EasingStyle.Elastic,
                Enum.EasingDirection.Out,
            );

            this.model.PivotTo(startCFrame.mul(CFrame.Angles(0, math.rad(360 * easedAlpha), 0)));

            if (linearAlpha >= 1) {
                this.spinConnection?.Disconnect();
                this.spinConnection = undefined;
                print("No more spin :(");
            }
        });
    }

    public setParentPoint(newParentPoint: Attachment, tweenSpeed: number): void {
        const woosh: Sound = this.model.WaitForChild("SpawnIn") as Sound
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
        woosh.Play();
        task.wait(tweenSpeed);
        this.spin();
        while (this.spinConnection !== undefined) {
	        task.wait();
        }
    }

    public async destroy(): Promise<void> {
        const pop: Sound = this.model.WaitForChild("Pop") as Sound
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
        task.wait(0.2)
        pop.Play();
    }
}