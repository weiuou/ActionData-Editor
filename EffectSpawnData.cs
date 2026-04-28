using System.ComponentModel;
using UnityEngine;

public class EffectSpawnData : TimelineData
{
    /// <summary>
    /// 特效、子弹创建控制
    /// </summary>
    public EffectSpawn effectSpawn;
    /// <summary>
    /// 伤害数据
    /// </summary>
    [DefaultValue(0f)]
    public BattleData battleData;

    protected bool executed;

    public override void InitOnActionEnter(Transform transform)
    {
        executed = false;
    }

    public override void Execute(Transform transform, float progress)
    {
        if (progress > timingBegin && executed == false && transform.TryGetComponent<INormalActionReceiver>(out var actionReceiver) && ActionBulletManager.Instance.TryGetBullet(effectSpawn.objCode, out GameObject prefab))
        {
            // 创建局部变量，复制当前值，否则lambda会捕获到currentAction的引用
            actionReceiver.CreateBulletOrEffect(prefab,
                                                (HitEnemyInfo info) => actionReceiver.OnBulletHitEnemy(GetHashCode().ToString(), battleData, info),
                                                effectSpawn
                                                );

            executed = true;
        }
    }
}
