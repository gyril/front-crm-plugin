const { Pool } = require('pg');
const pool = new Pool({ssl: {
  rejectUnauthorized: false,
}});

const query = `select  \n
    w.id, w."firstName", w."lastName", ihw."institution", i."name", \n
    case when ihw.statut=0 then 'Salarié' else  \n
    case when ihw.statut=1 then 'Vacataire' else  \n
    case when ihw.statut in (2,3) then 'Market worker'  \n
    end end end as "statut", \n
  w."phone", \n
    CASE WHEN ihw."isDeletedFromNetwork" THEN 'NON' \n
    ELSE 'OUI' \n
    END as "Dans le réseau", \n
    CASE WHEN not ihw."isDeletedFromNetwork"  \n
    THEN (select concat ("firstName",' ',"lastName") from admin where admin."id"=ihw."acceptedBy") \n
    END as "Accepté par", \n
    CASE WHEN not ihw."isDeletedFromNetwork"  \n
    THEN ihw."updatedAt" \n
    END as "Accepté le", \n
  max(smssend."createdAt") as "Date du dernier SMS d'inactivité reçu", \n
    CASE WHEN w."isNotificationOn" THEN 'OUI' \n
    ELSE 'NON' \n
    END as "NotificationSMS_active", \n
    CASE WHEN ihw."isWorkerNotified" THEN 'OUI' \n
    ELSE 'NON' \n
    END as "Établissement activé", \n
    CASE WHEN w."isEmailNotificationOn" THEN 'OUI' \n
    ELSE 'NON' \n
    END as "NotificationEmail_active", \n
    CASE WHEN t."isDay" THEN 'OUI' \n
    ELSE 'NON' \n
    END as "Préférence_jour", \n
    CASE WHEN t."isNight" THEN 'OUI' \n
    ELSE 'NON' \n
    END as "Préférence_nuit", \n
  array_agg( distinct j.name ::text || ' : ' || \n
    CASE WHEN  ihwhj."isAccepted" THEN 'OUI' \n
    WHEN ihwhj."isAccepted" IS NULL THEN 'A traiter' \n
    ELSE 'NON' \n
    END)   as "Job accepté ?", \n
  ihw."deletedBy" as "Supprimé par", \n
  ihw."deletedAt" as "Supprimé quand", \n
  array_agg(distinct ihwbs."service") as "Services bloqués", \n
  array_agg(distinct service.name) as "Noms services bloqués", \n
  array_agg(distinct ihwbs."isRefusedByWorker") as "Bloqué_par_le_worker", \n
  array_agg(distinct spe."name") as "Specialties",  \n
  COALESCE(json_agg(DISTINCT info."name" || ':' || i_h_w_h_info."value") FILTER (WHERE i_h_w_h_info."value" IS NOT NULL), '[]') as "Infos" \n
 \n
  from worker w \n
  left join institution_has_worker ihw on ihw.worker = w.id \n
  left join institution_has_worker_has_job ihwhj on ihwhj."institution_has_worker"=ihw."id" \n
  left join job j on j."id" = ihwhj."job" \n
  left join institution i on i.id = ihw.institution \n
  left join institution_has_worker_blocks_service ihwbs on ihwbs."worker"=w.id and ihwbs."institution"=i."id" \n
  left join institution_has_worker_has_specialty ihwhs on ihwhs."worker"=w.id and ihwhs."institution"=i."id" \n
  --and  ihwhs."isAccepted" is true \n
  left join specialty spe on spe."id"=ihwhs."specialty" \n
  left join timepreference t on t."worker"=w."id" \n
  LEFT JOIN Institution_has_Worker_has_Infoonworker i_h_w_h_info ON ihw."id" = i_h_w_h_info."institution_has_Worker" \n
  LEFT JOIN InfoOnWorker info ON i_h_w_h_info."infoOnWorker" = info."id" \n
  left join service on service.id=ihwbs.service \n
  left join institutionoption as io on io.institution = ihw.institution \n
  left join smssend on (smssend.worker=w.id and smssend.template='TEMPLATE__WORKER__INACTIVE_SMS') \n
 \n
  where (not io."isMedgoDemo" or io."isMedgoDemo" is null)  \n
  and w.email = $1 \n
 \n
  group by w."id", w."firstName", w."lastName", ihw."institution", i."name", ihw."isDeletedFromNetwork", ihw."deletedBy", ihw."isWorkerNotified",ihw."deletedAt", \n
  t."isDay",t."isNight",ihw."updatedAt",ihw."acceptedBy", ihw.statut, i_h_w_h_info."value" \n
 \n
`;

const getDataForContact = async (contactEmail) => {
  const client = await pool.connect();
  let data;

  try {
    const res = await client.query(query, [contactEmail]);
    data = res.rows.length === 0 ? null : res.rows;
  } finally {
    // Make sure to release the client before any error handling,
    // just in case the error handling itself throws an error.
    client.release();
    return data;
  }
};

module.exports = {
  getDataForContact: getDataForContact
};