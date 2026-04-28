using UnityEngine;

public class JointCollData : TimelineData
{
    /// <summary>
    /// 伤害数据
    /// </summary>
    public BattleData battleData;
    /// <summary>
    /// 碰撞有效的关节节点
    /// </summary>
    public string[] joints;

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
            if (DuringTimeline(progress) && transform.TryGetComponent(out INormalActionReceiver receiver))
            {
                receiver.ActionAbility.EnableJointColl(GetHashCode().ToString(), battleData, joints);
                enabled = true;
                executed = true;
            }
        }
        else if (enabled)
        {
            if (!DuringTimeline(progress) && transform.TryGetComponent(out INormalActionReceiver receiver))
            {
                receiver.ActionAbility.DisableJointColl();
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
