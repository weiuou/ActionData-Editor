using System;
using System.ComponentModel;

[Serializable]
public struct ActionData
{
    /// <summary>
    /// 唯一标识符
    /// </summary>
    public string id;
    /// <summary>
    /// 招式名称
    /// </summary>
    public string name;
    /// <summary>
    /// 招式指令
    /// </summary>
    public string command;
    /// <summary>
    /// 对应的animator中的state名称
    /// </summary>
    public string animStateName;
    /// <summary>
    /// 动作开始时对应的动画起点
    /// </summary>
    public float animBegin;
    /// <summary>
    /// 动作结束时对应的动画终点
    /// </summary>
    public float animEnd;
    /// <summary>
    /// 动画播放的速度
    /// </summary>
    public float animSpeed;
    /// <summary>
    /// 进入前是否可变向
    /// </summary>
    public bool dirChangeable;
    /// <summary>
    /// 时间轴事件
    /// </summary>
    public TimelineData[] TimelineDatas;
    /// <summary>
    /// 如果自然结束，接下来前往什么招式，如果为空则回到Idle
    /// </summary>
    public string nextActionId;
    /// <summary>
    /// 可派生动作的信息
    /// </summary>
    public ActionDerivation[] derivations;
}


/// <summary>
/// 特效、子弹创建
/// </summary>
[Serializable]
public struct EffectSpawn
{
    /// <summary>
    /// 创建物体的键值
    /// </summary>
    [DefaultValue("")]
    public string objCode;
    /// <summary>
    /// 相对创建者位置x
    /// </summary>
    [DefaultValue(0f)]
    public float relativeX;
    /// <summary>
    /// 相对创建者位置y
    /// </summary>
    [DefaultValue(0f)]
    public float relativeY;
    /// <summary>
    /// 相对创建者位置z
    /// </summary>
    [DefaultValue(0f)]
    public float relativeZ;
    /// <summary>
    /// 相对创建者旋转x
    /// </summary>
    [DefaultValue(0f)]
    public float rotationX;
    /// <summary>
    /// 相对创建者旋转y
    /// </summary>
    [DefaultValue(0f)]
    public float rotationY;
    /// <summary>
    /// 相对创建者旋转z
    /// </summary>
    [DefaultValue(0f)]
    public float rotationZ;
    /// <summary>
    /// 是否要跟随创建者
    /// </summary>
    [DefaultValue(false)]
    public bool followYou;
    /// <summary>
    /// 碰撞后是否要销毁
    /// </summary>
    [DefaultValue(true)]
    public bool destroyWhenColl;
}

/// <summary>
/// 招式伤害与冲击力等战斗数值相关的数据
/// </summary>
[Serializable]
public struct BattleData
{
    /// <summary>
    /// 基础伤害
    /// </summary>
    public float damage;
    /// <summary>
    /// 当该招式多次造成伤害时的最小时间间隔
    /// </summary>
    public float damageInterval;
    /// <summary>
    /// 当该招式多次造成伤害时的伤害衰减
    /// </summary>
    public float damageDamping;
    /// <summary>
    /// 招式额外暴击率（1.0f为100%暴击）
    /// </summary>
    public float criticalRateEx;
    /// <summary>
    /// 造成打断
    /// </summary>
    public bool makeBreak;
    /// <summary>
    /// 招式冲击力
    /// </summary>
    public ImpartType impartType;
}

/// <summary>
/// 冲击类等级
/// </summary>
public enum ImpartType
{
    Normal, Weak, Strong, Blow, Down
}

/// <summary>
/// 派生相关的数据
/// </summary>
[Serializable]
public struct ActionDerivation
{
    /// <summary>
    /// 派生检查时段
    /// </summary>
    public PercentageRange checkPeriod;

    /// <summary>
    /// 最早执行派生的时间点
    /// 位置在checkPeriod之间
    /// </summary>
    // 与之相对的最晚执行派生的时间点就是checkPeriod
    // 保证执行派生的时间点在fastExitTime和checkPeriod.max之间
    public float fastExitTime;

    /// <summary>
    /// 接下来前往什么招式
    /// </summary>
    public string nextActionId;
}