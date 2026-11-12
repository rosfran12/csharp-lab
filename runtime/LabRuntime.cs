using UnityEngine;

[RequireComponent(typeof(AudioSource))]
public class LabRuntime : MonoBehaviour
{
    [Range(0f, 20f)] public float velocidad = 5f;
    public AudioClip paso;
    public string eventoWwise = "Play_Footstep";
    public string rtpcWwise = "Speed";
    private AudioSource fuente;
    private float proximoPaso;
    void Start()
    {
        fuente = GetComponent<AudioSource>();
        fuente.playOnAwake = false;
#if CSHARP_LAB_WWISE
        AkUnitySoundEngine.RegisterGameObj(gameObject);
#endif
        Debug.Log("C# Lab: vida = " + (100 - 25));
    }
    void Update()
    {
        transform.Translate(Vector3.forward * velocidad * Time.deltaTime);
#if CSHARP_LAB_WWISE
        AkUnitySoundEngine.SetRTPCValue(rtpcWwise, velocidad / 20f * 100f, gameObject);
#endif
        if (velocidad <= 0 || Time.time < proximoPaso) return;
        proximoPaso = Time.time + 0.5f;
        if (paso != null) fuente.PlayOneShot(paso);
#if CSHARP_LAB_WWISE
        AkUnitySoundEngine.PostEvent(eventoWwise, gameObject);
#endif
    }
    void OnDestroy()
    {
#if CSHARP_LAB_WWISE
        AkUnitySoundEngine.UnregisterGameObj(gameObject);
#endif
    }
}
