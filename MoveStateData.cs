using System.ComponentModel;
using UnityEngine;

public class MoveStateData : TimelineData
{
    public MoveStateData()
    {
        useGhostLayer = false;
        useGravity = true;
        useCommand = false;
        moveVelMultiAddition = 0f;
        useRootMotion = false;
    }

    /// <summary>
    /// 角色是否以Ghost物理碰撞层移动
    /// </summary>
    [DefaultValue(false)]
    public bool useGhostLayer;
    /// <summary>
    /// 是否使用重力
    /// </summary>
    [DefaultValue(true)]
    public bool useGravity;
    /// <summary>
    /// 是否使用character的command进行移动，也就是技能释放期间允许自由移动
    /// </summary>
    [DefaultValue(false)]
    public bool useCommand;
    /// <summary>
    /// 角色的移速倍率补正
    /// </summary>
    [DefaultValue(0f)]
    public float moveVelMultiAddition;
    /// <summary>
    /// 是否附加animator的rootMotion
    /// </summary>
    [DefaultValue(false)]
    public bool useRootMotion;

    public override void Execute(Transform transform, float progress)
    {
        if (DuringTimeline(progress) && transform.TryGetComponent<NormalCharacter>(out var normalCharacter))
        {
            normalCharacter.LockedNormalPosition = !useCommand;

            if (useCommand)
            {
                normalCharacter.PositionAbility._velocityMulti["action addition"] = moveVelMultiAddition;
            }

            if (useRootMotion)
            {
                var delta = normalCharacter.AnimMgr.GetRootMotionDelta();
                normalCharacter.PositionAbility.ApplyPositionOffset(delta.positionDelta);
                normalCharacter.transform.rotation *= delta.rotationDelta;
            }

            if (useGhostLayer)
            {
                normalCharacter.CharacterCollider._useGhostMode = useGhostLayer;
            }

            normalCharacter.Rigid.useGravity = useGravity;
        }
    }
}
