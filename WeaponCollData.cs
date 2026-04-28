using CGame.BeatUp;
using UnityEngine;

public class WeaponCollData : TimelineData
{
    /// <summary>
    /// 伤害数据
    /// </summary>
    public BattleData battleData;

    protected bool death;
    protected bool executed;
    protected bool enabled;

    public override void InitOnActionEnter(Transform transform)
    {
        death = false;
        executed = false;
        enabled = false;
    }

    public override void Execute(Transform transform, float progress)
    {
        if (death)
        {
            return;
        }
        else if (!executed)
        {
            if (DuringTimeline(progress) && transform.TryGetComponent(out IBuBattleWithPropReceiver receiver))
            {
                receiver.PropAbility.EnableWeaponColl(GetHashCode().ToString(), battleData);
                enabled = true;
                executed = true;
            }
        }
        else if (enabled)
        {
            if (!DuringTimeline(progress) && transform.TryGetComponent(out IBuBattleWithPropReceiver receiver))
            {
                receiver.PropAbility.DisableWeaponColl();
                Recycle();
            }
        }
    }

    private void Recycle()
    {
        death = true;
        executed = false;
        enabled = false;
    }
}
