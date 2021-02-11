select  
  w.id, w."firstName", w."lastName", ihw."institution", i."name", 
  case when ihw.statut=0 then 'Salarié' else  
  case when ihw.statut=1 then 'Vacataire' else  
  case when ihw.statut in (2,3) then 'Market worker'  
  end end end as "statut", 
  w."phone", 
    CASE WHEN ihw."isDeletedFromNetwork" THEN 'NON' 
  ELSE 'OUI' 
  END as "Dans le réseau", 
  CASE WHEN not ihw."isDeletedFromNetwork"  
  THEN (select concat ("firstName",' ',"lastName") from admin where admin."id"=ihw."acceptedBy") 
  END as "Accepté par", 
  CASE WHEN not ihw."isDeletedFromNetwork"  
  THEN ihw."updatedAt" 
  END as "Accepté le", 
  max(smssend."createdAt") as "Date du dernier SMS d'inactivité reçu", 
  CASE WHEN w."isNotificationOn" THEN 'OUI' 
  ELSE 'NON' 
  END as "NotificationSMS_active", 
  CASE WHEN ihw."isWorkerNotified" THEN 'OUI' 
  ELSE 'NON' 
  END as "Établissement activé", 
  CASE WHEN w."isEmailNotificationOn" THEN 'OUI' 
  ELSE 'NON' 
  END as "NotificationEmail_active", 
  CASE WHEN t."isDay" THEN 'OUI' 
  ELSE 'NON' 
  END as "Préférence_jour", 
  CASE WHEN t."isNight" THEN 'OUI' 
  ELSE 'NON' 
  END as "Préférence_nuit", 
  array_agg( distinct j.name ::text || ' : ' || 
    CASE WHEN  ihwhj."isAccepted" THEN 'OUI' 
    WHEN ihwhj."isAccepted" IS NULL THEN 'A traiter' 
    ELSE 'NON' 
    END)   as "Job accepté ?", 
  ihw."deletedBy" as "Supprimé par", 
  ihw."deletedAt" as "Supprimé quand", 
  array_agg(distinct ihwbs."service") as "Services bloqués", 
  array_agg(distinct service.name) as "Noms services bloqués", 
  array_agg(distinct ihwbs."isRefusedByWorker") as "Bloqué_par_le_worker", 
  array_agg(distinct spe."name") as "Specialties",  
  COALESCE(json_agg(DISTINCT info."name" || ':' || i_h_w_h_info."value") FILTER (WHERE i_h_w_h_info."value" IS NOT NULL), '[]') as "Infos" 
 
  from worker w 
  left join institution_has_worker ihw on ihw.worker = w.id 
  left join institution_has_worker_has_job ihwhj on ihwhj."institution_has_worker"=ihw."id" 
  left join job j on j."id" = ihwhj."job" 
  left join institution i on i.id = ihw.institution 
  left join institution_has_worker_blocks_service ihwbs on ihwbs."worker"=w.id and ihwbs."institution"=i."id" 
  left join institution_has_worker_has_specialty ihwhs on ihwhs."worker"=w.id and ihwhs."institution"=i."id" 
  --and  ihwhs."isAccepted" is true 
  left join specialty spe on spe."id"=ihwhs."specialty" 
  left join timepreference t on t."worker"=w."id" 
  LEFT JOIN Institution_has_Worker_has_Infoonworker i_h_w_h_info ON ihw."id" = i_h_w_h_info."institution_has_Worker" 
  LEFT JOIN InfoOnWorker info ON i_h_w_h_info."infoOnWorker" = info."id" 
  left join service on service.id=ihwbs.service 
  left join institutionoption as io on io.institution = ihw.institution 
  left join smssend on (smssend.worker=w.id and smssend.template='TEMPLATE__WORKER__INACTIVE_SMS') 
 
  where (not io."isMedgoDemo" or io."isMedgoDemo" is null)  
  and w.email = $1 
 
  group by w."id", w."firstName", w."lastName", ihw."institution", i."name", ihw."isDeletedFromNetwork", ihw."deletedBy", ihw."isWorkerNotified",ihw."deletedAt", 
  t."isDay",t."isNight",ihw."updatedAt",ihw."acceptedBy", ihw.statut, i_h_w_h_info."value";